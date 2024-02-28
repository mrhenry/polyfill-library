'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('es-419', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('es-419').length