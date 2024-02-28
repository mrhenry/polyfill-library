'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('twq', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('twq').length