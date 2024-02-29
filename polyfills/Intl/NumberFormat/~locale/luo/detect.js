'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('luo', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('luo').length