'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('so-DJ', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('so-DJ').length