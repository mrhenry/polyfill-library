'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ca-ES-VALENCIA', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ca-ES-VALENCIA').length