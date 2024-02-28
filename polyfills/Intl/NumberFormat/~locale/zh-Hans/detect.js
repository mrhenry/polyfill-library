'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('zh-Hans', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('zh-Hans').length