'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('os', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('os').length