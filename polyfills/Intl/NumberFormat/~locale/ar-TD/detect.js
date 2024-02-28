'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ar-TD', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ar-TD').length