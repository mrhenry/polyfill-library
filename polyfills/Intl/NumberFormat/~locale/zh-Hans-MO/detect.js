'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('zh-Hans-MO', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('zh-Hans-MO').length