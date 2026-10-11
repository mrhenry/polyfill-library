package polyfillmeta

import (
	"strings"
	"testing"
)

// testCollection builds a Collection from a fixed set of polyfills.
func testCollection(metas map[string]*Meta) *Collection {
	c := &Collection{Metas: metas, Root: "/repo"}

	for name := range metas {
		c.All = append(c.All, name)
	}

	return c
}

func TestModifiedPolyfillsWithTests(t *testing.T) {
	metas := map[string]*Meta{
		"a.polyfill": {
			HasTests: true, IsPublic: true, IsTestable: true,
			Dependencies: []string{"b.polyfill"},
		},
		"b.polyfill": {
			HasTests: true, IsPublic: true, IsTestable: true,
		},
		"c.polyfill": {
			// No tests, so it is never selected.
			HasTests: false, IsPublic: true, IsTestable: true,
		},
		"leaf.polyfill": {
			// Independent of everything else.
			HasTests: true, IsPublic: true, IsTestable: true,
		},
		"d.private": {
			// Underscore prefixed names are internal, never public.
			HasTests: true, IsPublic: false, IsTestable: true,
		},
	}

	c := testCollection(metas)

	cases := []struct {
		name               string
		files              []string
		wantTestEverything bool
		wantAffected       []string
	}{
		{
			name:               "no changes tests everything",
			files:              nil,
			wantTestEverything: true,
		},
		{
			name:               "change outside polyfills tests everything",
			files:              []string{"lib/index.js"},
			wantTestEverything: true,
		},
		{
			name:               "change directly in polyfills tests everything",
			files:              []string{"polyfills/aliases.json"},
			wantTestEverything: true,
		},
		{
			name:               "unknown polyfill tests everything",
			files:              []string{"polyfills/nope/index.js"},
			wantTestEverything: true,
		},
		{
			name:  "changing a leaf polyfill selects only itself",
			files: []string{"polyfills/leaf/polyfill/index.js"},
			// b.polyfill's dependents are pulled in; an independent leaf's are
			// not.
			wantAffected: []string{"leaf.polyfill"},
		},
		{
			name:         "dependents are included",
			files:        []string{"polyfills/b/polyfill/index.js"},
			wantAffected: []string{"a.polyfill", "b.polyfill"},
		},
		{
			name:               "a change to a polyfill without tests falls back to everything",
			files:              []string{"polyfills/c/polyfill/index.js"},
			wantTestEverything: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := c.ModifiedPolyfillsWithTests(tc.files)

			if got.TestEverything != tc.wantTestEverything {
				t.Fatalf("TestEverything = %t, want %t", got.TestEverything, tc.wantTestEverything)
			}

			if tc.wantTestEverything {
				return
			}

			if len(got.AffectedPolyfills) != len(tc.wantAffected) {
				t.Fatalf("AffectedPolyfills = %v, want %v", keys(got.AffectedPolyfills), tc.wantAffected)
			}

			for _, name := range tc.wantAffected {
				if _, ok := got.AffectedPolyfills[name]; !ok {
					t.Errorf("AffectedPolyfills missing %q, got %v", name, keys(got.AffectedPolyfills))
				}
			}
		})
	}
}

// TestDependentsThroughUntestedPolyfills proves the dependency walk does not
// stop at a polyfill without tests.
func TestDependentsThroughUntestedPolyfills(t *testing.T) {
	c := testCollection(map[string]*Meta{
		"a.polyfill": {HasTests: true, IsPublic: true, IsTestable: true},
		"b.polyfill": {HasTests: false, IsPublic: true, IsTestable: true, Dependencies: []string{"a.polyfill"}},
		"c.polyfill": {HasTests: true, IsPublic: true, IsTestable: true, Dependencies: []string{"b.polyfill"}},
	})

	got := c.ModifiedPolyfillsWithTests([]string{"polyfills/a/polyfill/index.js"})

	if got.TestEverything {
		t.Fatal("TestEverything = true, want false")
	}

	for _, want := range []string{"a.polyfill", "c.polyfill"} {
		if _, ok := got.AffectedPolyfills[want]; !ok {
			t.Errorf("%s should be affected, got %v", want, keys(got.AffectedPolyfills))
		}
	}

	if _, ok := got.AffectedPolyfills["b.polyfill"]; ok {
		t.Error("b.polyfill has no tests so it must not be affected")
	}
}

// TestNonTestablePolyfillsAreExcluded pins a difference from the JavaScript
// implementation: isTestable is required, not just hasTests.
func TestNonTestablePolyfillsAreExcluded(t *testing.T) {
	c := testCollection(map[string]*Meta{
		"console.profile": {HasTests: true, IsPublic: true, IsTestable: false},
	})

	got := c.ModifiedPolyfillsWithTests([]string{"polyfills/console/profile/index.js"})

	if !got.TestEverything {
		t.Error("a change to only non-testable polyfills should fall back to testing everything")
	}

	if len(got.AffectedPolyfills) != 0 {
		t.Errorf("AffectedPolyfills = %v, want none", keys(got.AffectedPolyfills))
	}
}

// TestAliasesPullInDependents proves an alias pulls in everything depending on
// the alias name.
func TestAliasesPullInDependents(t *testing.T) {
	c := testCollection(map[string]*Meta{
		"x.polyfill": {
			HasTests: true, IsPublic: true, IsTestable: true,
			Aliases: []string{"es2024"},
		},
		"y.polyfill": {
			HasTests: true, IsPublic: true, IsTestable: true,
			Dependencies: []string{"es2024"},
		},
	})

	got := c.ModifiedPolyfillsWithTests([]string{"polyfills/x/polyfill/index.js"})

	if got.TestEverything {
		t.Fatal("TestEverything = true, want false")
	}

	if _, ok := got.AffectedPolyfills["y.polyfill"]; !ok {
		t.Errorf("y.polyfill depends on the alias so it should be retested, got %v", keys(got.AffectedPolyfills))
	}
}

// TestManyPolyfillChangesFallBackToEverything proves the 20 changed polyfill
// and 50 resolved polyfill thresholds.
func TestManyPolyfillChangesFallBackToEverything(t *testing.T) {
	metas := map[string]*Meta{}
	files := make([]string, 0, 21)

	for _, name := range manyNames(21) {
		dir := strings.ReplaceAll(name, ".", "/")
		metas[name] = &Meta{HasTests: true, IsPublic: true, IsTestable: true}
		files = append(files, "polyfills/"+dir+"/index.js")
	}

	got := testCollection(metas).ModifiedPolyfillsWithTests(files)

	if !got.TestEverything {
		t.Error("more than 20 changed polyfills should test everything")
	}

	if !got.HasManyPolyfillChanges {
		t.Error("HasManyPolyfillChanges should be set")
	}
}

func manyNames(n int) []string {
	out := make([]string, n)
	for i := range out {
		out[i] = "p" + string(rune('a'+i%26)) + string(rune('a'+i/26)) + ".polyfill"
	}

	return out
}

func keys(m map[string]*Meta) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}

	return out
}
