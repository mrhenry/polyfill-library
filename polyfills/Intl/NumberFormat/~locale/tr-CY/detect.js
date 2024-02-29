'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('tr-CY', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('tr-CY').length