'Intl' in self && Intl.PluralRules && Intl.PluralRules.supportedLocalesOf && (function() { try { return Intl.PluralRules.supportedLocalesOf("ee").length === 1; } catch (e) { return false; } }())