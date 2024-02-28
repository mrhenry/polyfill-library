'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('mni-Beng', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('mni-Beng').length