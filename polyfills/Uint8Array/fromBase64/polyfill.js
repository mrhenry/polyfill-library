/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.1.1 Uint8Array.fromBase64 ( string [ , options ] )
CreateMethodProperty(Uint8Array, "fromBase64", function fromBase64(string /* , options */) {
	if (arguments.length > 1) {
		return ArrayBufferBase64Utils.uint8Array.fromBase64(string, arguments[1]);
	} else {
		return ArrayBufferBase64Utils.uint8Array.fromBase64(string);
	}
});
