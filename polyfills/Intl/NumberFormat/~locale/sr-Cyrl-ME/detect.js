'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sr-Cyrl-ME', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sr-Cyrl-ME').length