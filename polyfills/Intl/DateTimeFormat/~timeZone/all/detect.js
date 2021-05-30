(function (global) {
	if ('Intl' in global && 'DateTimeFormat' in global.Intl && 'format' in global.Intl.DateTimeFormat.prototype) {
			try {
				return (new Intl.DateTimeFormat('en', {
					timeZone: 'Africa/Dakar',
					timeZoneName: 'short'
				}).format(new Date(Date.UTC(2012, 11, 20, 3, 0, 0, 200))).slice(-3) === 'GMT');
			} catch(e) {
				return false;
			}
	}

	return false;
}(self))
