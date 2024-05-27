describe('console', function () {

	it('error()', function () {
		proclaim.doesNotThrow(function () {
			console.error();
		});
	});

});
