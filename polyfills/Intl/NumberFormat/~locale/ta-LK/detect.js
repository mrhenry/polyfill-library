'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ta-LK', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ta-LK').length