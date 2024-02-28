'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bn-IN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bn-IN').length