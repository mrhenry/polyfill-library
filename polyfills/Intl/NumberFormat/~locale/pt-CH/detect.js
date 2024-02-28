'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pt-CH', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pt-CH').length