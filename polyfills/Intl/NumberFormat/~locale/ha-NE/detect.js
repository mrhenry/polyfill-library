'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ha-NE', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ha-NE').length