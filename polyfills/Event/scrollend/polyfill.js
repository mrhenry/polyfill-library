(function (global) {
	var scrollEndEvent = new global.Event('scrollend');
	var pointers = new global.Set();

	// Track if any pointer is active
	global.document.addEventListener('touchstart', function (e) {
		for (var i = 0; i < e.changedTouches.length; i++) {
			pointers.add(e.changedTouches[i].identifier);
		}
	}, { passive: true });

	global.document.addEventListener('touchend', function (e) {
		for (var i = 0; i < e.changedTouches.length; i++) {
			pointers.delete(e.changedTouches[i].identifier);
		}
	}, { passive: true });

	// Map of scroll-observed elements.
	var observed = new global.WeakMap();

	// Forward and observe calls to a native method.
	function observe(proto, method, handler) {
		var native = proto[method];
		proto[method] = function () {
			var args = global.Array.prototype.slice.apply(arguments, [0]);
			native.apply(this, args);
			args.unshift(native);
			handler.apply(this, args);
		}
	}

	function onAddListener(originalFn, type, handler, options) { // eslint-disable-line no-unused-vars
		// Polyfill scrollend event on any element for which the developer listens
		// to 'scrollend' explicitly or 'scroll' (so that adding a scrollend listener
		// from within a scroll listener works).
		if (type !== 'scroll' && type !== 'scrollend') {
			return;
		}

		var scrollPort = this;

		var data = observed.get(scrollPort);
		if (data !== undefined) {
			data.listeners[type]++;
			return;
		}

		var timeout = 0;

		data = {
			scrollListener: function scrollListener(evt) { // eslint-disable-line no-unused-vars
				clearTimeout(timeout);

				timeout = setTimeout(function () {
					if (pointers.size) {
						// if pointer(s) are down, wait longer
						setTimeout(data.scrollListener, 100);
						return;
					}

					// dispatch
					if (scrollPort) {
						scrollPort.dispatchEvent(scrollEndEvent);
					}
				}, 100);

			},
			listeners: {
				scroll: 0,
				scrollend: 0
			}
		};

		originalFn.apply(scrollPort, ['scroll', data.scrollListener]);
		observed.set(scrollPort, data);
	}

	function onRemoveListener(originalFn, type, handler) { // eslint-disable-line no-unused-vars
		if (type !== 'scroll' && type !== 'scrollend') {
			return;
		}

		var scrollPort = this;
		var data = observed.get(scrollPort);

		if (data === undefined) {
			return;
		}

		data.listeners[type] = Math.max(0, data.listeners[type] - 1);
		// If there are still listeners, nothing more to do.
		if ((data.listeners.scroll + data.listeners.scrollend) > 0) {
			return;
		}

		// Otherwise, remove the added listeners.
		originalFn.apply(scrollPort, ['scroll', data.scrollListener]);
		observed.delete(scrollPort);
	}

	observe(global.Element.prototype, 'addEventListener', onAddListener);
	observe(global, 'addEventListener', onAddListener);
	observe(global.document, 'addEventListener', onAddListener);
	observe(global.Element.prototype, 'removeEventListener', onRemoveListener);
	observe(global, 'removeEventListener', onRemoveListener);
	observe(global.document, 'removeEventListener', onRemoveListener);

	if (!('onscrollend' in self)) {
		// Make sure a check for 'onhashchange' in window will pass
		global.onscrollend = null;
	}
}(self));
