'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('os-RU', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('os-RU').length