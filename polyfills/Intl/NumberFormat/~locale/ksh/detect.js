'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ksh', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ksh').length