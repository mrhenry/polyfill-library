'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('vai-Latn', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('vai-Latn').length