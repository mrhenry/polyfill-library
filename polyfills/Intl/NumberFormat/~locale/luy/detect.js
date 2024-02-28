'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('luy', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('luy').length