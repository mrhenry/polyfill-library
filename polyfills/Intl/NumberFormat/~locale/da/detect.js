'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('da', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('da').length