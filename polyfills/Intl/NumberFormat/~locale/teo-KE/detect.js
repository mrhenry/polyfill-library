'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('teo-KE', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('teo-KE').length