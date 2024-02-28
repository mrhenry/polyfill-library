'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('mai', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('mai').length