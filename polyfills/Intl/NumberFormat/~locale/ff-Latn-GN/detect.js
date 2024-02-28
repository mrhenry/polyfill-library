'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ff-Latn-GN', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ff-Latn-GN').length