'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('en-BS', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('en-BS').length