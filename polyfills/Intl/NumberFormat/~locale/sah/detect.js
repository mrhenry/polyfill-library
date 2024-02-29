'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sah', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sah').length