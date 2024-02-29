'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('hr-BA', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('hr-BA').length