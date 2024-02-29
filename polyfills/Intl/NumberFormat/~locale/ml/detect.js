'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ml', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ml').length