'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ps-PK', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ps-PK').length