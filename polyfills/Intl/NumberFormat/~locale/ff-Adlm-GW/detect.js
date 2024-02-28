'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('ff-Adlm-GW', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('ff-Adlm-GW').length