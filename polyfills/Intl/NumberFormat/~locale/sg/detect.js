'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('sg', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('sg').length