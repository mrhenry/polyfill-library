/* global ArrayBufferBase64Utils, CreateMethodProperty, Uint8Array */
// 23.3.2.4 Uint8Array.prototype.toHex ( )
CreateMethodProperty(Uint8Array.prototype, "toHex", function toHex() {
	return ArrayBufferBase64Utils.uint8ArrayPrototype.toHex(this);
});
