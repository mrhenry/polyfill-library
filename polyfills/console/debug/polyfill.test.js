describe('console', function () {

	it('debug()', function () {
		proclaim.doesNotThrow(function () {
			console.debug();
		});
	});

});
