'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('fr-SC', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('fr-SC').length