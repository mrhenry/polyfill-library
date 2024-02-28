'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('en-RW', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('en-RW').length