'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ca-AD', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ca-AD').length