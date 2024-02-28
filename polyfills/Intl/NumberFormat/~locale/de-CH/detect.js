'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('de-CH', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('de-CH').length