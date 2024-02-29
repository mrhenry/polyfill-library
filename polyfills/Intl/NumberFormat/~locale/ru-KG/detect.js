'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ru-KG', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ru-KG').length