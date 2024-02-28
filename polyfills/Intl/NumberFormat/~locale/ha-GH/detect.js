'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ha-GH', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ha-GH').length