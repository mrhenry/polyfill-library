'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nnh', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nnh').length