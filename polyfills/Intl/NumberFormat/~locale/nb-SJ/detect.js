'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nb-SJ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nb-SJ').length