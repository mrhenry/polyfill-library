'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('so-KE', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('so-KE').length