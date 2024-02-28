'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ar-QA', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ar-QA').length