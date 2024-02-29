'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('khq', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('khq').length