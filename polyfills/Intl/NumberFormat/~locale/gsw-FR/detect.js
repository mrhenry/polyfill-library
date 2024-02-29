'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('gsw-FR', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('gsw-FR').length