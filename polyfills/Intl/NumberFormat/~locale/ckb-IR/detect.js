'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ckb-IR', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ckb-IR').length