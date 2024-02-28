'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('en-MG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('en-MG').length