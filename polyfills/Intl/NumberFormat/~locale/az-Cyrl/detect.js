'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('az-Cyrl', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('az-Cyrl').length