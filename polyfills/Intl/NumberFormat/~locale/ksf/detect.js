'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ksf', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ksf').length