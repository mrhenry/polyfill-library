'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ks-Arab', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ks-Arab').length