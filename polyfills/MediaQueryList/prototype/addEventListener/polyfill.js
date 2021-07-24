(function(global) {
	"use strict";

	var _addListener = global.MediaQueryList.prototype.addListener;
	var _removeListener = global.MediaQueryList.prototype.removeListener;

	global.MediaQueryList.prototype.addListener = function addListener(listener) {
		var handler = listener;
		if (handler.handleEvent) {
			handler = handler.handleEvent;
		}

		_addListener.call(this, handler);
	};

	global.MediaQueryList.prototype.removeListener = function removeListener(listener) {
		var handler = listener;
		if (handler.handleEvent) {
			handler = handler.handleEvent;
		}

		_removeListener.call(this, handler);
	};

	global.MediaQueryList.prototype.addEventListener = function addEventListener(type, listener) {
		if (type === 'change') {
			this.addListener(listener);
		}

		if (arguments[2] && arguments[2].once) {
			var _this = this;
			var remover = function () {
				_this.removeListener(remover);
				_this.removeListener(listener);
			}
			this.addListener(remover);
		}
	};

	global.MediaQueryList.prototype.removeEventListener = function removeEventListener(type, listener) {
		if (type === 'change') {
			this.removeListener(listener);
		}
	};

	// Best effort.
	// Some browsers don't support setters.
	if ((function () {
		// supports setters (not IE8)
		try {
			var a = {};
			global.Object.defineProperty(a, 't', {
				configurable: true,
				enumerable: false,
				get: function () { return this._v; },
				set: function (v) { this._v = v + v; }
			});
			a.t = 1;
			return (a.t === 2);
		} catch (e) {
			return false;
		}
	}())) {
		global.Object.defineProperty(global.MediaQueryList.prototype, "onchange", {
			enumerable: true,
			configurable: true,
			get: function () {
				return this._onchangeHandler || null;
			},
			set: function (listener) {
				var _this = this;
				if (!_this._onchangeListener) {
					_this._onchangeListener = function () {
						if (typeof _this._onchangeHandler !== 'function') {
							return;
						}

						_this._onchangeHandler.call(_this, arguments[0]);
					};

					_this.addEventListener('change', _this._onchangeListener);
				}

				_this._onchangeHandler = listener;
			}
		});
	}
}(self));
