'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bo', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bo').length