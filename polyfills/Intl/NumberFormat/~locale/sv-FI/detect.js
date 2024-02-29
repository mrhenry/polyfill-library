'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sv-FI', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sv-FI').length