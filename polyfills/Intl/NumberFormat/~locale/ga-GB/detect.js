'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ga-GB', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ga-GB').length