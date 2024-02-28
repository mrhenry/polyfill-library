'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('fr-BI', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('fr-BI').length