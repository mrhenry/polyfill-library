'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('so-ET', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('so-ET').length