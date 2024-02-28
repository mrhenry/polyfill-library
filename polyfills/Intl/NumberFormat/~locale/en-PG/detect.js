'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('en-PG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('en-PG').length