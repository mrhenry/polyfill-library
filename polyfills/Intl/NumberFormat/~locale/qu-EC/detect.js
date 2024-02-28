'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('qu-EC', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('qu-EC').length