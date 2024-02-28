'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ln-CG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ln-CG').length