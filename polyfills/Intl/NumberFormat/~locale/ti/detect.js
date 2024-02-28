'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ti', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ti').length