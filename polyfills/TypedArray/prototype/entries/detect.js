// use "Int8Array" as a proxy for support of "TypedArray" subclasses
'Int8Array' in self && 'Symbol' in self && 'iterator' in self.Symbol && !!self.Int8Array.prototype.entries && !!new self.Int8Array().entries()[self.Symbol.iterator]
