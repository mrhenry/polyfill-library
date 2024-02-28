'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ro-MD', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ro-MD').length