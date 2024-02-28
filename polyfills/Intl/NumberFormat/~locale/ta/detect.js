'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ta', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ta').length