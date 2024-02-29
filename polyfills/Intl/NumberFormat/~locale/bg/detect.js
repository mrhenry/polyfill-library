'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bg', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bg').length