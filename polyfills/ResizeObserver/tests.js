/* eslint-env mocha, browser */
/* global proclaim */

describe("ResizeObserver", function() {
	var delay = function(callback) {
		setTimeout(function() {
			callback()
		}, 100)
	}

	var el
	var ro

	beforeEach(function(done) {
		el = document.createElement("div")
		el.style.width = "100px"
		document.body.appendChild(el)
		// Make sure it's a clean frame to run the test on
		requestAnimationFrame(function() {
			done()
		})
	})

	afterEach(function() {
		while (document.body.firstElementChild) {
			document.body.removeChild(document.body.firstElementChild)
		}
		if (ro) {
			ro.disconnect()
			ro = null
		}
	})

	it("console.log(ResizeObserver) should be prettified", function() {
		proclaim.deepStrictEqual(
			ResizeObserver.toString(),
			"function ResizeObserver () { [polyfill code] }"
		)
	})

	it("Throw error when no callback is passed to constructor", function() {
		var fn = function() {
			new ResizeObserver()
		}
		proclaim["throws"](
			fn,
			"Failed to construct 'ResizeObserver': 1 argument required, but only 0 present."
		)
	})

	it("Throw error when an invalid callback is passed to constructor", function() {
		var fn = function() {
			new ResizeObserver(1)
		}
		proclaim["throws"](
			fn,
			"Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function."
		)
	})

	it("Throw error when no target is passed to observe()", function() {
		var fn = function() {
			ro = new ResizeObserver(function() {})
			ro.observe()
		}
		proclaim["throws"](
			fn,
			"Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present."
		)
	})

	it("Throw error when an invalid target is passed to observe()", function() {
		var fn = function() {
			ro = new ResizeObserver(function() {})
			ro.observe(1)
		}
		proclaim["throws"](
			fn,
			"Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element"
		)
	})

	it("Throw error when a null target is passed to observe()", function() {
		var fn = function() {
			ro = new ResizeObserver(function() {})
			ro.observe(null)
		}
		proclaim["throws"](
			fn,
			"Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element"
		)
	})

	it("Throw error when no target is passed to unobserve()", function() {
		var fn = function() {
			ro = new ResizeObserver(function() {})
			ro.unobserve()
		}
		proclaim["throws"](
			fn,
			"Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present."
		)
	})

	it("Throw error when an invalid target is passed to unobserve()", function() {
		var fn = function() {
			ro = new ResizeObserver(function() {})
			ro.unobserve(1)
		}
		proclaim["throws"](
			fn,
			"Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element"
		)
	})

	it("Observer should not fire initially when size is 0,0", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		el.style.width = "0"
		el.style.height = "0"
		ro.observe(el)
		delay(done)
	})

	it("Observer should not fire initially when display:none", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		el.style.display = "none"
		ro.observe(el)
		delay(done)
	})

	it("Observer should not fire initially when parent element is display:none", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		var child = document.createElement("div")
		el.style.display = "none"
		child.style.display = "block"
		el.append(child)
		proclaim.deepStrictEqual(el.style.display, "none")
		proclaim.deepStrictEqual(child.style.display, "block")
		ro.observe(child)
		delay(done)
	})

	it("Observer should not fire when an element has no document", function(done) {
		el = el.cloneNode()
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		el.style.width = "0"
		el.style.height = "0"
		ro.observe(el)
		delay(done)
	})

	it("Observer callback.this should be observer", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(this, ro)
			done()
		})
		ro.observe(el)
	})

	it("Observer should fire initially when element has size and display", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: 100,
				height: 0
			})
			done()
		})
		ro.observe(el)
	})

	it("Observer should only allow watching the same element once", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: 100,
				height: 0
			})
			done()
		})
		ro.observe(el)
		ro.observe(el)
	})

	it("Observer should fire when element size changes", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: 100,
				height: 200
			})
			done()
		})
		el.style.width = "0"
		el.style.height = "0"
		ro.observe(el)
		delay(function() {
			el.style.width = "100px"
			el.style.height = "200px"
		})
	})

	it("Observer should fire when the element's hidden state is toggled", function(done) {
		var count = 0
		ro = new ResizeObserver(function(entries) {
			count += 1
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: count !== 2 ? 100 : 0,
				height: 0
			})
			if (count === 3) {
				done()
			}
		})
		ro.observe(el)
		delay(function() {
			el.style.display = "none"
			delay(function() {
				el.style.removeProperty("display")
			})
		})
	})

	it("Observer should fire when only the width changes", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: 100,
				height: 0
			})
			done()
		})
		el.style.width = "0"
		el.style.height = "0"
		ro.observe(el)
		delay(function() {
			el.style.width = "100px"
		})
	})

	it("Observer should fire when only the height changes", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 0,
				left: 0,
				width: 0,
				height: 100
			})
			done()
		})
		el.style.width = "0"
		el.style.height = "0"
		ro.observe(el)
		delay(function() {
			el.style.height = "100px"
		})
	})

	it("Observer should handle padding on an element.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 1,
				left: 4,
				width: 100,
				height: 200
			})
			done()
		})
		el.style.width = "100px"
		el.style.height = "200px"
		el.style.padding = "1px 2px 3px 4px"
		ro.observe(el)
	})

	it("Observer should handle vertical scrollbars on an element.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				width: 85,
				height: 200
			})
			done()
		})
		Object.defineProperty(el, "offsetWidth", {
			get: function() {
				return 100
			}
		})
		Object.defineProperty(el, "offsetHeight", {
			get: function() {
				return 200
			}
		})
		Object.defineProperty(el, "clientWidth", {
			get: function() {
				return 85
			}
		})
		Object.defineProperty(el, "clientHeight", {
			get: function() {
				return 200
			}
		})
		el.style.overflowY = "scroll"
		el.style.width = "100px"
		el.style.height = "200px"
		ro.observe(el)
	})

	it("Observer should handle horizontal scrollbars on an element.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				width: 100,
				height: 185
			})
			done()
		})
		Object.defineProperty(el, "offsetWidth", {
			get: function() {
				return 100
			}
		})
		Object.defineProperty(el, "offsetHeight", {
			get: function() {
				return 200
			}
		})
		Object.defineProperty(el, "clientWidth", {
			get: function() {
				return 100
			}
		})
		Object.defineProperty(el, "clientHeight", {
			get: function() {
				return 185
			}
		})
		el.style.overflowX = "scroll"
		el.style.width = "100px"
		el.style.height = "200px"
		ro.observe(el)
	})

	it("Observer should handle horizontal and vertical scrollbars on an element.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				width: 85,
				height: 185
			})
			done()
		})
		Object.defineProperty(el, "offsetWidth", {
			get: function() {
				return 100
			}
		})
		Object.defineProperty(el, "offsetHeight", {
			get: function() {
				return 200
			}
		})
		Object.defineProperty(el, "clientWidth", {
			get: function() {
				return 85
			}
		})
		Object.defineProperty(el, "clientHeight", {
			get: function() {
				return 185
			}
		})
		el.style.overflowX = "scroll"
		el.style.overflowY = "scroll"
		el.style.width = "100px"
		el.style.height = "200px"
		ro.observe(el)
	})

	it("Observer should handle box-sizing and padding correctly.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(entries[0].contentRect, {
				top: 1,
				left: 4,
				width: 94,
				height: 196
			})
			done()
		})
		el.style.width = "100px"
		el.style.height = "200px"
		el.style.padding = "1px 2px 3px 4px"
		el.style.boxSizing = "border-box"
		ro.observe(el)
	})

	it("Observer should fire when text content changes", function(done) {
		ro = new ResizeObserver(function() {
			done()
		})
		ro.observe(el)
		delay(function() {
			el.textContent = "Hello"
		})
	})

	it("Observer should unobserve elements correctly.", function(done) {
		var el2 = el.cloneNode()
		document.body.appendChild(el2)
		ro = new ResizeObserver(function(entries, observer) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(observer, ro)
			done()
		})
		ro.observe(el)
		ro.observe(el2)
		ro.unobserve(el2)
	})

	it("Observer should allow trying to unobserve multiple times.", function(done) {
		var el2 = el.cloneNode()
		document.body.appendChild(el2)
		ro = new ResizeObserver(function(entries, observer) {
			proclaim.deepStrictEqual(entries, 1)
			proclaim.deepStrictEqual(entries[0].target, el)
			proclaim.deepStrictEqual(observer, ro)
			done()
		})
		ro.observe(el)
		ro.observe(el2)
		ro.unobserve(el2)
		ro.unobserve(el2)
	})

	it("Observer should disconnect correctly.", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		ro.observe(el)
		ro.disconnect()
		delay(done)
	})

	it("Observer should allow trying to disconnect multiple times.", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		ro.observe(el)
		ro.disconnect()
		ro.disconnect()
		delay(done)
	})

	it("Observer should not observe after a disconnect.", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		ro.observe(el)
		ro.disconnect()
		ro.observe(el)
		delay(done)
	})

	it("Observer should allow disconnect and unobserve to be called.", function(done) {
		ro = new ResizeObserver(function() {
			proclaim.deepStrictEqual(false, true) // Should not fire
		})
		ro.observe(el)
		ro.disconnect()
		ro.unobserve(el)
		delay(done)
	})

	it("Observer should fire resize loop errors.", function(done) {
		window.addEventListener(
			"error",
			function(e) {
				proclaim.deepStrictEqual(e.type, "error")
				proclaim.deepStrictEqual(
					e.message,
					"ResizeObserver loop completed with undelivered notifications."
				)
				done()
			},
			{once: true}
		)
		ro = new ResizeObserver(function(entries) {
			entries.forEach(function(entry) {
				var target = entry.target
				target.style.width = entry.contentRect.width + 1000 + "px"
			})
		})
		ro.observe(el)
	})

	it("Observer should return itself in the callback.", function(done) {
		ro = new ResizeObserver(function(entries, observer) {
			proclaim.deepStrictEqual(observer, observer)
			done()
		})
		ro.observe(el)
	})

	it("Calculations should be run after all other raf callbacks have been fired.", function(done) {
		ro = new ResizeObserver(function(entries) {
			proclaim.deepStrictEqual(entries[0].contentRect.width, 2000)
			done()
		})
		ro.observe(el)
		requestAnimationFrame(function() {
			el.style.width = "2000px"
		})
	})
})
