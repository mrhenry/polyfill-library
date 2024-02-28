'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('mg', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('mg').length