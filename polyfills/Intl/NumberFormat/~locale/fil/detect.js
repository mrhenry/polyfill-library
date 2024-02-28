'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('fil', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('fil').length