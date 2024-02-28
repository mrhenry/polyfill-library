'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ff-Adlm-MR', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ff-Adlm-MR').length