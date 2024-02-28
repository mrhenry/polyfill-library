'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sd-Arab', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sd-Arab').length