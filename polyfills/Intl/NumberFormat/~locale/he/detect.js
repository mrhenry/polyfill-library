'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('he', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('he').length