'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sd-Deva', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sd-Deva').length