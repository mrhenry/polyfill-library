'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('it-VA', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('it-VA').length