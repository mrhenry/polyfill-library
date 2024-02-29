'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nl-AW', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nl-AW').length