/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.2.1 Uint8Array.prototype.setFromBase64 ( string [ , options ] )
CreateMethodProperty(Uint8Array.prototype, "setFromBase64", function setFromBase64(string /* , options */) {
	if (arguments.length > 1) {
		return ArrayBufferBase64Utils.uint8ArrayPrototype.setFromBase64(this, string, arguments[1]);
	} else {
		return ArrayBufferBase64Utils.uint8ArrayPrototype.setFromBase64(this, string);
	}
});
