'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nl-SR', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nl-SR').length