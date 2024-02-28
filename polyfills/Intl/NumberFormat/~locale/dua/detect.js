'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('dua', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('dua').length