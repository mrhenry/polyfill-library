'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ii', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ii').length