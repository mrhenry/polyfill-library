'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nl-BE', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nl-BE').length