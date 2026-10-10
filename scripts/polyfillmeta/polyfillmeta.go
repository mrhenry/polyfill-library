// Package polyfillmeta reads the built polyfill metadata and works out which
// polyfills a change set affects.
//
// This is a port of test/utils/modified-polyfills-with-tests.js. The build
// writes everything needed into polyfills/__dist.
package polyfillmeta

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Meta is the per-polyfill metadata the harness cares about.
type Meta struct {
	Aliases      []string          `json:"aliases"`
	Dependencies []string          `json:"dependencies"`
	Browsers     map[string]string `json:"browsers"`
	BaseDir      string            `json:"baseDir"`
	HasTests     bool              `json:"hasTests"`
	IsTestable   bool              `json:"isTestable"`
	IsPublic     bool              `json:"isPublic"`
	Order        int               `json:"order"`
}

// Collection is every polyfill the build produced.
type Collection struct {
	All    []string
	Metas  map[string]*Meta
	Root   string
	distFS string
}

// distPath is the directory the build writes into, relative to the repo root.
const distPath = "polyfills/__dist"

// Load reads the built polyfill index and the per-polyfill metadata.
func Load(repoRoot string) (*Collection, error) {
	dist := filepath.Join(repoRoot, distPath)

	// polyfills/__dist/meta.json is the authoritative feature list, exactly as
	// lib/sources.js listPolyfills() uses it. Directory names are not a
	// reliable substitute: polyfill names contain dots alongside non-polyfill
	// siblings (meta.json, aliases.json).
	index := map[string]*Meta{}

	raw, err := os.ReadFile(filepath.Join(dist, "meta.json"))
	if err != nil {
		return nil, fmt.Errorf("reading %s/meta.json: %w (run `npm run build` first)", distPath, err)
	}

	if err := json.Unmarshal(raw, &index); err != nil {
		return nil, fmt.Errorf("parsing %s/meta.json: %w", distPath, err)
	}

	c := &Collection{
		Metas:  map[string]*Meta{},
		Root:   repoRoot,
		distFS: dist,
	}

	for name, meta := range index {
		// The per-polyfill file carries hasTests, isTestable, isPublic and
		// baseDir, which the index does not.
		if perFeature, err := os.ReadFile(filepath.Join(dist, name, "meta.json")); err == nil {
			if err := json.Unmarshal(perFeature, meta); err != nil {
				return nil, fmt.Errorf("parsing %s/%s/meta.json: %w", distPath, name, err)
			}
		}

		c.Metas[name] = meta
		c.All = append(c.All, name)
	}

	if len(c.All) == 0 {
		return nil, fmt.Errorf("no polyfills found in %s/meta.json", distPath)
	}

	sort.Strings(c.All)

	return c, nil
}

// Meta returns the metadata for one polyfill.
func (c *Collection) Meta(name string) (*Meta, bool) {
	meta, ok := c.Metas[name]

	return meta, ok
}

// Modified is the outcome of inspecting a change set.
type Modified struct {
	// Polyfills maps polyfill name to metadata for every polyfill the change
	// touches directly.
	Polyfills map[string]*Meta
	// AffectedPolyfills is the transitive set of polyfills with tests that
	// need re-running: the changed polyfills plus everything that depends on
	// them, restricted to those that have tests.
	AffectedPolyfills map[string]*Meta

	HasOtherChanges        bool
	HasManyPolyfillChanges bool
	TestEverything         bool
}

// hasTestsOnly reports whether a polyfill can be exercised in the browser.
func hasTestsOnly(m *Meta) bool {
	return m.IsPublic && m.IsTestable && m.HasTests
}

// PolyfillsWithTests returns every polyfill with a browser test suite.
func (c *Collection) PolyfillsWithTests() map[string]*Meta {
	out := map[string]*Meta{}
	for _, name := range c.All {
		if m := c.Metas[name]; hasTestsOnly(m) {
			out[name] = m
		}
	}

	return out
}

// ModifiedPolyfillsWithTests resolves a change set into the set of polyfills
// whose tests must run.
//
// It mirrors modifiedPolyfillsWithTests: anything outside polyfills/, any
// change to a file directly in polyfills/, an unknown polyfill, more than 20
// changed polyfills, no resulting polyfills with tests, or more than 50
// resolved polyfills all fall back to testing everything.
func (c *Collection) ModifiedPolyfillsWithTests(modifiedFiles []string) *Modified {
	if len(modifiedFiles) == 0 {
		return &Modified{
			Polyfills:      map[string]*Meta{},
			TestEverything: true,
		}
	}

	modified := &Modified{Polyfills: map[string]*Meta{}}

	for _, modifiedFile := range modifiedFiles {
		modifiedFile = filepath.ToSlash(modifiedFile)

		// 1.a. Not a polyfill change.
		if !strings.HasPrefix(modifiedFile, "polyfills/") {
			modified.HasOtherChanges = true
			modified.TestEverything = true

			continue
		}

		// 1.b.I. A file directly in the polyfills directory.
		polyfillPath := filepath.ToSlash(filepath.Dir(modifiedFile))
		if polyfillPath == "polyfills" {
			modified.HasOtherChanges = true
			modified.TestEverything = true

			continue
		}

		relative := strings.TrimPrefix(polyfillPath, "polyfills/")
		name := strings.ReplaceAll(relative, "/", ".")

		// 1.b.II. Unknown polyfill.
		meta, ok := c.Meta(name)
		if !ok {
			modified.HasOtherChanges = true
			modified.TestEverything = true

			continue
		}

		// 1.b.III. A known polyfill.
		modified.Polyfills[name] = meta
	}

	// 2. Unrelated changes already force a full run.
	if modified.TestEverything {
		return modified
	}

	// 3. Too many polyfill changes.
	if len(modified.Polyfills) > 20 {
		modified.HasManyPolyfillChanges = true
		modified.TestEverything = true

		return modified
	}

	// 4. Seed the changed set with the polyfills and their aliases.
	changed := map[string]bool{}
	for name := range modified.Polyfills {
		changed[name] = true

		for _, alias := range modified.Polyfills[name].Aliases {
			changed[alias] = true
		}
	}

	// 5. Walk the dependency graph until nothing new turns up.
	dependents := c.dependents()
	for foundMore := true; foundMore; {
		foundMore = false

		for changedName := range changed {
			for _, dependent := range dependents[changedName] {
				if !changed[dependent] {
					changed[dependent] = true
					foundMore = true
				}
			}
		}
	}

	// 6. Keep only polyfills that actually have tests.
	affected := map[string]*Meta{}
	for name := range changed {
		if meta, ok := c.Meta(name); ok && hasTestsOnly(meta) {
			affected[name] = meta
		}
	}

	modified.AffectedPolyfills = affected

	// 7. Nothing testable changed, so test everything to be safe.
	if len(modified.AffectedPolyfills) == 0 {
		modified.TestEverything = true

		return modified
	}

	// 8. The resolved dependency list grew too large.
	if len(modified.AffectedPolyfills) > 50 {
		modified.HasManyPolyfillChanges = true
		modified.TestEverything = true
	}

	return modified
}

// dependents maps a polyfill name to every polyfill that depends on it,
// directly or through another polyfill.
func (c *Collection) dependents() map[string][]string {
	out := map[string][]string{}

	for _, name := range c.All {
		for _, dependency := range c.Metas[name].Dependencies {
			out[dependency] = append(out[dependency], name)
		}
	}

	return out
}
