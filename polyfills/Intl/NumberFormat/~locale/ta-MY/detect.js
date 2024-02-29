'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ta-MY', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ta-MY').length