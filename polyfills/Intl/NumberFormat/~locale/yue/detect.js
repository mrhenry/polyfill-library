'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('yue', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('yue').length