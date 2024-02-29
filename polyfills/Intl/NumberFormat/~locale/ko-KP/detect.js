'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ko-KP', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ko-KP').length