'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('yue-Hant', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('yue-Hant').length