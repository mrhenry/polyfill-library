'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pa-Arab', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pa-Arab').length