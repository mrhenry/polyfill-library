'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ms-BN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ms-BN').length