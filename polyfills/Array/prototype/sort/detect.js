'sort' in Array.prototype && (function() {
	// Check it does a stable sort
	var arr = [
		["z", "z"],
		["a", "a"],
		["z", "y"],
		["a", "b"],
		["z", "x"],
		["a", "c"],
		["z", "w"],
		["a", "d"],
		["z", "v"],
		["a", "e"],
		["z", "u"],
		["a", "f"],
		["z", "t"],
		["a", "h"]
	];
	arr.sort(function (a, b) {
		if (a[0] < b[0]) {
			return -1;
		}
		if (a[0] > b[0]) {
			return 1;
		}
		return 0;
	});
	return arr[0][1] === "a";
}())
