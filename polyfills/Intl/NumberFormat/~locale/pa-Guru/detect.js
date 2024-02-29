'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pa-Guru', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pa-Guru').length