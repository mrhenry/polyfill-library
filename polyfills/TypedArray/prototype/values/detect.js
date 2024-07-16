// use "Int8Array" as a proxy for support of "TypedArray" subclasses
'Int8Array' in self && 'Symbol' in self && 'iterator' in self.Symbol && !!self.Int8Array.prototype.values && !!new self.Int8Array().values()[self.Symbol.iterator]
