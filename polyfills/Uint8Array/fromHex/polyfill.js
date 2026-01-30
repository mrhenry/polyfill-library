/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.1.2 Uint8Array.fromHex ( string )
CreateMethodProperty(Uint8Array, "fromHex", function fromHex(string) {
	return ArrayBufferBase64Utils.uint8Array.fromHex(string);
});
