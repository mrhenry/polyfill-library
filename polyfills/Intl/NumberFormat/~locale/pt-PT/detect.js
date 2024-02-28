'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('pt-PT', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('pt-PT').length