'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('yue-Hans', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('yue-Hans').length