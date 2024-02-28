'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('su-Latn', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('su-Latn').length