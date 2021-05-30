(function (global) {
	if ('Intl' in global && 'DateTimeFormat' in global.Intl && 'format' in global.Intl.DateTimeFormat.prototype) {
			try {
				return (new Intl.DateTimeFormat('en', {
					timeZone: 'Australia/Sydney',
					timeZoneName: 'short'
				}).format(new Date(Date.UTC(2012, 11, 20, 3, 0, 0, 200))).slice(-6) === 'GMT+11');
			} catch(e) {
				return false;
			}
	}

	return false;
}(self))
