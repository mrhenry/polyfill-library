describe('console', function () {

	it('time()', function () {
		proclaim.doesNotThrow(function () {
			console.time();
		});
	});

});
