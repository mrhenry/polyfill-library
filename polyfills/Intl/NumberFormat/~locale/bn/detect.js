'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bn', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bn').length