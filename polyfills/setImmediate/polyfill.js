(function (global, undef) {
	"use strict";

	if (global.setImmediate) {
		return;
	}

	var nextHandle = 1; // Spec says greater than zero
	var tasksByHandle = {};
	var currentlyRunningATask = false;
	var doc = global.document;
	var setImmediatePolyfill;

	function addFromSetImmediateArguments(args) {
		tasksByHandle[nextHandle] = partiallyApplied.apply(undef, args);
		return nextHandle++;
	}

	// This function accepts the same arguments as setImmediate, but
	// returns a function that requires no arguments.
	function partiallyApplied(handler) {
		var args = [].slice.call(arguments, 1);
		return function() {
			if (typeof handler === "function") {
				handler.apply(undef, args);
			} else {
				(new Function("" + handler))();
			}
		};
	}

	function runIfPresent(handle) {
		// From the spec: "Wait until any invocations of this algorithm started before this one have completed."
		// So if we're currently running a task, we'll need to delay this invocation.
		if (currentlyRunningATask) {
			// Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
			// "too much recursion" error.
			setTimeout(partiallyApplied(runIfPresent, handle), 0);
		} else {
			var task = tasksByHandle[handle];
			if (task) {
				currentlyRunningATask = true;
				try {
					task();
				} finally {
					clearImmediate(handle);
					currentlyRunningATask = false;
				}
			}
		}
	}

	function clearImmediate(handle) {
		delete tasksByHandle[handle];
	}

	function canUsePostMessage() {
		// The test against `importScripts` prevents this implementation from being installed inside a web worker,
		// where `global.postMessage` means something completely different and can't be used for this purpose.
		if (global.postMessage && !global.importScripts) {
			var postMessageIsAsynchronous = true;
			var oldOnMessage = global.onmessage;
			global.onmessage = function() {
				postMessageIsAsynchronous = false;
			};
			global.postMessage("", "*");
			global.onmessage = oldOnMessage;
			return postMessageIsAsynchronous;
		}
	}

	function installPostMessageImplementation() {
		// Installs an event handler on `global` for the `message` event: see
		// * https://developer.mozilla.org/en/DOM/window.postMessage
		// * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

		var messagePrefix = "setImmediate$" + Math.random() + "$";
		var onGlobalMessage = function(event) {
			if (event.source === global &&
				typeof event.data === "string" &&
				event.data.indexOf(messagePrefix) === 0) {
				runIfPresent(+event.data.slice(messagePrefix.length));
			}
		};

		if (global.addEventListener) {
			global.addEventListener("message", onGlobalMessage, false);
		} else {
			global.attachEvent("onmessage", onGlobalMessage);
		}

		setImmediatePolyfill = function setImmediate(_) {
			var handle = addFromSetImmediateArguments(arguments);
			global.postMessage(messagePrefix + handle, "*");
			return handle;
		};
	}

	function installMessageChannelImplementation() {
		var channel = new MessageChannel();
		channel.port1.onmessage = function(event) {
			var handle = event.data;
			runIfPresent(handle);
		};

		setImmediatePolyfill = function setImmediate(_) {
			var handle = addFromSetImmediateArguments(arguments);
			channel.port2.postMessage(handle);
			return handle;
		};
	}

	function installReadyStateChangeImplementation() {
		var html = doc.documentElement;
		setImmediatePolyfill = function setImmediate(_) {
			var handle = addFromSetImmediateArguments(arguments);
			// Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
			// into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
			var script = doc.createElement("script");
			script.onreadystatechange = function () {
				runIfPresent(handle);
				script.onreadystatechange = null;
				html.removeChild(script);
				script = null;
			};
			html.appendChild(script);
			return handle;
		};
	}

	function installSetTimeoutImplementation() {
		setImmediatePolyfill = function setImmediate(_) {
			var handle = addFromSetImmediateArguments(arguments);
			setTimeout(partiallyApplied(runIfPresent, handle), 0);
			return handle;
		};
	}

	// If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	if (canUsePostMessage()) {
		// For non-IE10 modern browsers
		installPostMessageImplementation();

	} else if (global.MessageChannel) {
		// For web workers, where supported
		installMessageChannelImplementation();

	} else if (doc && "onreadystatechange" in doc.createElement("script")) {
		// For IE 6–8
		installReadyStateChangeImplementation();

	} else {
		// For older browsers
		installSetTimeoutImplementation();
	}

	attachTo.setImmediate = setImmediatePolyfill;
	attachTo.clearImmediate = clearImmediate;
}(self));
