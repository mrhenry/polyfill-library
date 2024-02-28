'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('zh-Hant-MO', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('zh-Hant-MO').length