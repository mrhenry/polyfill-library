'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ar-SS', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ar-SS').length