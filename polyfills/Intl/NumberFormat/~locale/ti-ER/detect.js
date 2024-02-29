'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ti-ER', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ti-ER').length