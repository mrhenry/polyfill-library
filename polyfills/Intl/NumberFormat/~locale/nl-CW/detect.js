'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nl-CW', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nl-CW').length