'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ur-IN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ur-IN').length