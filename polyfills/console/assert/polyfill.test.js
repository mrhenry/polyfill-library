describe('console', function () {

	it('assert()', function () {
		proclaim.doesNotThrow(function () {
			console.assert(1,1);
		});
	});

});
