/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.2.2 Uint8Array.prototype.setFromHex ( string )
CreateMethodProperty(Uint8Array.prototype, "setFromHex", function setFromHex(string) {
	return ArrayBufferBase64Utils.uint8ArrayPrototype.setFromHex(this, string);
});
