'Intl' in self &&
	'DateTimeFormat' in self.Intl &&
	'formatRangeToParts' in self.Intl.DateTimeFormat.prototype &&
	self.Intl.DateTimeFormat.supportedLocalesOf('ru-MD').length