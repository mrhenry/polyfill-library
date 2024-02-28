'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('wo', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('wo').length