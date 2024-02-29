'Intl' in self && Intl.NumberFormat && (function () {
		try {
		  new Intl.NumberFormat('el-CY', {
			style: 'unit',
			unit: 'byte'
		  });
		} catch (e) {
		  return false;
		}
		return true;
	  })() && Intl.NumberFormat.supportedLocalesOf('el-CY').length