'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('rwk', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('rwk').length