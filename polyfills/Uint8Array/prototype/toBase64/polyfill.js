/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.2.3 Uint8Array.prototype.toBase64 ( [ options ] )
CreateMethodProperty(Uint8Array.prototype, "toBase64", function toBase64(/* options */) {
	if (arguments.length > 0) {
		return ArrayBufferBase64Utils.uint8ArrayPrototype.toBase64(this, arguments[0]);
	} else {
		return ArrayBufferBase64Utils.uint8ArrayPrototype.toBase64(this);
	}
});
