/* eslint-env mocha, browser */
/* global proclaim */

it("should define the EventTarget methods on the MediaQueryList prototype", function() {
	proclaim.ok('addEventListener' in MediaQueryList.prototype);
	proclaim.ok('removeEventListener' in MediaQueryList.prototype);
});


// WPT
// We can only test these behaviours with native `matchMedia` as iframes don't trigger resize events.
if (typeof (window.matchMedia('(min-width: 1px)').listeners) === 'undefined') {
	describe('WPT', function () {
		var IFRAME_DEFAULT_SIZE = "200";
		var iframes = {};

		var cleanup = [];
		afterEach(function () {
			for (var i = 0; i < cleanup.length; i++) {
				cleanup[i]();
			}
			cleanup = [];
		});

		// helpers are defined with `var` so they are globally accessible
		function createMQL(cb) {
			createIFrame(function (iframe) {
				var mql = iframe.contentWindow.matchMedia('(max-width: ' + IFRAME_DEFAULT_SIZE + 'px)');
				proclaim.ok(mql.matches);
				iframes[mql] = iframe;
				cb(mql);
			});
		}

		function createIFrame(cb, width, height) {
			if (typeof width === 'undefined') {
				width = IFRAME_DEFAULT_SIZE;
			}

			if (typeof height === 'undefined') {
				height = width;
			}

			proclaim.ok(document.body);

			var iframe = document.createElement("iframe");
			iframe.src = document.getElementById('test-iframe-src').getAttribute('content');
			iframe.width = String(width);
			iframe.height = String(height);
			iframe.style.border = "none";

			cleanup.push(function () {
				document.body.removeChild(iframe);
			});

			iframe.addEventListener("load", function () {
				iframe.contentDocument.body.offsetWidth; // reflow
				cb(iframe);
			});

			document.body.appendChild(iframe);
		}

		function triggerMQLEvent(mql) {
			var iframe = iframes[mql];
			proclaim.ok(iframe);

			if (iframe.width === IFRAME_DEFAULT_SIZE) {
				iframe.width = "250";
			} else {
				iframe.width = IFRAME_DEFAULT_SIZE;
			}

			iframe.contentDocument.body.offsetWidth; // reflow
		}

		function waitForChangesReported(cb) {
			if ('requestAnimationFrame' in self) {
				requestAnimationFrame(function () {
					requestAnimationFrame(function () {
						cb();
					});
				});
			} else {
				setTimeout(function () {
					cb();
				}, 500);
			}
		}

		it("calls listeners added through addListener", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = function () {
					calls++;
				};

				mql.addListener(listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 1);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("calls listeners added through addEventListener", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = function () {
					calls++;
				};

				mql.addEventListener('change', listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 1);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("calls listeners once that are added with addListener and addEventListener", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = {
					handleEvent: function handleEvent() {
						calls++;
					}
				};

				mql.addListener(listener);
				mql.addEventListener('change', listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 1);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("removes listener added with addListener through removeEventListener", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = {
					handleEvent: function handleEvent() {
						calls++;
					}
				};

				mql.addListener(listener);
				mql.removeEventListener('change', listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 0);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("removes listener added with addEventListener through removeListener", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = {
					handleEvent: function handleEvent() {
						calls++;
					}
				};

				mql.addEventListener('change', listener);
				mql.removeListener(listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 0);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("does not call listeners of other types", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = function () {
					calls++;
				};

				mql.addEventListener('matches', listener);

				triggerMQLEvent(mql);

				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 0);
						done();
					} catch (err) {
						done(err);
					}
				});
			});
		});

		it("respects once", function (done) {
			createMQL(function (mql) {
				var calls = 0;
				var listener = function () {
					calls++;
				};

				mql.addEventListener('change', listener, { once: true });

				triggerMQLEvent(mql);
				waitForChangesReported(function () {
					try {
						proclaim.equal(calls, 1);

						triggerMQLEvent(mql);
						waitForChangesReported(function () {
							try {
								proclaim.equal(calls, 1);
								done();
							} catch (err) {
								done(err);
							}
						});

					} catch (err) {
						done(err);
					}
				});
			});
		});

		if ((function () {
			// supports setters (not IE8)
			try {
				var a = {};
				Object.defineProperty(a, 't', {
					configurable: true,
					enumerable: false,
					get: function () {
						return this._v;
					},
					set: function (v) {
						this._v = v + v;
					}
				});

				a.t = 1;
				return (a.t === 2);
			} catch (e) {
				return false;
			}
		}())) {
			it("adds a listener through onchange", function (done) {
				createMQL(function (mql) {
					var _event;
					mql.onchange = function (event) {
						_event = event;
					};

					triggerMQLEvent(mql);
					waitForChangesReported(function () {
						try {
							proclaim.ok(_event);
							proclaim.equal(_event.media, mql.media);
							proclaim.equal(_event.matches, mql.matches);
							done();
						} catch (err) {
							done(err);
						}
					});
				});
			});

			it("removes a listener through onchange", function (done) {
				createMQL(function (mql) {
					var calls = 0;
					mql.onchange = function () {
						calls++;
					};

					triggerMQLEvent(mql);
					waitForChangesReported(function () {
						try {
							proclaim.equal(calls, 1);

							mql.onchange = null;

							triggerMQLEvent(mql);
							waitForChangesReported(function () {
								try {
									proclaim.equal(calls, 1);
									done();
								} catch (err) {
									done(err);
								}
							});

						} catch (err) {
							done(err);
						}
					});
				});
			});

			it("does not remove an onchange listener through removeEventListener", function (done) {
				createMQL(function (mql) {
					var calls = 0;
					mql.onchange = function () {
						calls++;
					};

					mql.removeEventListener('change', mql.onchange);

					triggerMQLEvent(mql);
					waitForChangesReported(function () {
						try {
							proclaim.equal(calls, 1);
							done();
						} catch (err) {
							done(err);
						}
					});
				});
			});
		}
	});
}
