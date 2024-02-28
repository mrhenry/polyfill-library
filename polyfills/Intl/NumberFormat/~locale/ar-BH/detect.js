'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ar-BH', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ar-BH').length