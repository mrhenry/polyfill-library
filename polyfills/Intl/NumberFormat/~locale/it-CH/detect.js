'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('it-CH', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('it-CH').length