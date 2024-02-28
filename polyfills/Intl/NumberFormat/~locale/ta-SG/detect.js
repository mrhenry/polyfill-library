'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ta-SG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ta-SG').length