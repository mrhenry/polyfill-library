'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ar-YE', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ar-YE').length