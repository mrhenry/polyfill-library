'Intl' in self && Intl.PluralRules && Intl.PluralRules.supportedLocalesOf && (function() { try { return Intl.PluralRules.supportedLocalesOf("doi").length === 1; } catch (e) { return false; } }())