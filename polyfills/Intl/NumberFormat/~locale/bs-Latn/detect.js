'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bs-Latn', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bs-Latn').length