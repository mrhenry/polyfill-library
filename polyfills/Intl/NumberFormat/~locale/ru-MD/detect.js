'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ru-MD', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ru-MD').length