'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bo-IN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bo-IN').length