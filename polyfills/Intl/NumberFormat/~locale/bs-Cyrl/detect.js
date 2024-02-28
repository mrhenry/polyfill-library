'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('bs-Cyrl', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('bs-Cyrl').length