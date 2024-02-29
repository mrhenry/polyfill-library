'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ca-FR', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ca-FR').length