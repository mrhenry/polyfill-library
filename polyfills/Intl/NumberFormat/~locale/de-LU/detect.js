'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('de-LU', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('de-LU').length