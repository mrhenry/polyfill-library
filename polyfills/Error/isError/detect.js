"isError" in Error && "DOMException" in self && (function () {
	try {
		return Error.isError(new DOMException());
	} catch (_) {
		return "isError" in Error;
	}
}())
