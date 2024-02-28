'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('yo-BJ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('yo-BJ').length