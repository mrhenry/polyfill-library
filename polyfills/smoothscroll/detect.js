('document' in self && 'documentElement' in self.document && 'style' in self.document.documentElement && 'scrollBehavior' in document.documentElement.style) || (function () {
  try {
    var supportsSmoothScroll = false;

    var scrollOptions = {
      top: 1,
      left: 0
    };

    Object.defineProperty(scrollOptions, 'behavior', {
      get: function () {
        supportsSmoothScroll = true;
        return 'smooth';
      },

      // Ensure this property lasts through cloning / destructuring:
      enumerable: true
    });

    var a = document.createElement('DIV');
    var b = document.createElement('DIV');
    a.setAttribute('style', 'height: 1px; overflow: scroll;');
    b.setAttribute('style', 'height: 2px; overflow: scroll;');

    a.appendChild(b);
    a.scrollTo(scrollOptions);

    return supportsSmoothScroll;
  } catch (e) {
    return false;
  }
})();
