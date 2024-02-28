'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('naq', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('naq').length