'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('az-Latn', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('az-Latn').length