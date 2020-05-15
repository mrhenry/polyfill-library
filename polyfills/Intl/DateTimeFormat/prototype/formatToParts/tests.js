/* eslint-env mocha */
/* globals proclaim */

it('performs basic formatting', function () {
  var opts = { year: "numeric", month: "numeric", weekday: 'long', day: "numeric" };
  var df = new Intl.DateTimeFormat("ko-KR", opts);
  var formattedResult = df.formatToParts(Date.UTC(2012, 11, 17, 3, 0, 42));  
  proclaim.isTrue(formattedResult !== undefined);
});
