'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('fr-BJ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('fr-BJ').length