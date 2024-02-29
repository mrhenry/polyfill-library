'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('se-FI', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('se-FI').length