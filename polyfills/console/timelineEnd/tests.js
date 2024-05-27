describe('console', function () {

	it('timelineEnd()', function () {
		proclaim.doesNotThrow(function () {
			console.timelineEnd();
		});
	});

});
