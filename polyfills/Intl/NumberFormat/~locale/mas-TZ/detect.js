'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('mas-TZ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('mas-TZ').length