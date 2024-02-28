'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('tzm', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('tzm').length