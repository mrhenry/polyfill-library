'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sat-Olck', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sat-Olck').length