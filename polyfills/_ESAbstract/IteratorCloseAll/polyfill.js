/* global IteratorClose, NormalCompletion, ThrowCompletion */
// 7.4.12 IteratorCloseAll ( iters, completion )
function IteratorCloseAll(iters, completion) { // eslint-disable-line no-unused-vars
	// 1. For each element iter of iters, in reverse List order, do
	for (var i = iters.length - 1; i >= 0; i--) {
		var iter = iters[i];
		// a. Set completion to Completion(IteratorClose(iter, completion)).
		try {
			completion = NormalCompletion(IteratorClose(iter, completion));
		} catch (error) {
			completion = ThrowCompletion(error);
		}
	}
	// 2. Return ? completion.
	if (completion["[[Type]]"] === "throw") {
		throw completion["[[Value]]"];
	}
	return completion["[[Value]]"];
}
