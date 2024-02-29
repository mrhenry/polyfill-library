'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('nds-NL', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('nds-NL').length