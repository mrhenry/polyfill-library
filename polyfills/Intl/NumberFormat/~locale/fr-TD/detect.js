'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('fr-TD', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('fr-TD').length