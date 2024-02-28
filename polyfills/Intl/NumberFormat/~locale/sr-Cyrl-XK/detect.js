'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sr-Cyrl-XK', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sr-Cyrl-XK').length