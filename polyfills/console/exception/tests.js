describe('console', function () {

	it('exception()', function () {
		proclaim.doesNotThrow(function () {
			console.exception();
		});
	});

});
