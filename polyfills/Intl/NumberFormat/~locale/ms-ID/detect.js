'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ms-ID', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ms-ID').length