describe('console', function () {

	it('groupEnd()', function () {
		proclaim.doesNotThrow(function () {
			console.groupEnd();
		});
	});

});
