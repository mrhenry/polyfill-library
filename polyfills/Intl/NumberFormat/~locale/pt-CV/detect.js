'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pt-CV', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pt-CV').length