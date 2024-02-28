'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('en-DG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('en-DG').length