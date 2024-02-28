'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('zh-Hant-HK', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('zh-Hant-HK').length