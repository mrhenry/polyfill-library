describe('console', function () {

	it('trace()', function () {
		proclaim.doesNotThrow(function () {
			console.trace();
		});
	});

});
