'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pt-MZ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pt-MZ').length