'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ne-IN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ne-IN').length