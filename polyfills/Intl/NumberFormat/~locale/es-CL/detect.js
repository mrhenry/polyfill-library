'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('es-CL', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('es-CL').length