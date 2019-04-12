// Minimal polyfill for Edge 15's lack of `isIntersecting`
// See: https://github.com/w3c/IntersectionObserver/issues/211
Object.defineProperty(window.IntersectionObserverEntry.prototype,
  'isIntersecting', {
  get: function () {
    return this.intersectionRatio > 0;
  }
});