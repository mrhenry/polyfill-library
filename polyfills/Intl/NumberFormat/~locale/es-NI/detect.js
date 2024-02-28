'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('es-NI', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('es-NI').length