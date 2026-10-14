current_dir=$(pwd)

echo "update polyfills/AbortController";
cd "$current_dir/polyfills/AbortController/";
npm update && npm install && npm outdated;

echo "update polyfills/ArrayBuffer";
cd "$current_dir/polyfills/ArrayBuffer/";
npm update && npm install && npm outdated;

echo "update polyfills/AudioContext";
cd "$current_dir/polyfills/AudioContext/";
npm update && npm install && npm outdated;

echo "update polyfills/HTMLPictureElement";
cd "$current_dir/polyfills/HTMLPictureElement/";
npm update && npm install && npm outdated;

echo "update polyfills/HTMLTemplateElement";
cd "$current_dir/polyfills/HTMLTemplateElement/";
npm update && npm install && npm outdated;

echo "update polyfills/Intl";
cd "$current_dir/polyfills/Intl/";
npm update && npm install && npm outdated;

echo "update polyfills/MutationObserver";
cd "$current_dir/polyfills/MutationObserver/";
npm update && npm install && npm outdated;

echo "update polyfills/ResizeObserver";
cd "$current_dir/polyfills/ResizeObserver/";
npm update && npm install && npm outdated;

echo "update polyfills/String/prototype/normalize";
cd "$current_dir/polyfills/String/prototype/normalize/";
npm update && npm install && npm outdated;

echo "update polyfills/URL";
cd "$current_dir/polyfills/URL/";
npm update && npm install && npm outdated;

echo "update polyfills/UserTiming";
cd "$current_dir/polyfills/UserTiming/";
npm update && npm install && npm outdated;

echo "update polyfills/WebAnimations";
cd "$current_dir/polyfills/WebAnimations/";
npm update && npm install && npm outdated;

echo "update polyfills/_IteratorHelpers";
cd "$current_dir/polyfills/_IteratorHelpers/";
npm update && npm install && npm outdated;

echo "update polyfills/atob";
cd "$current_dir/polyfills/atob/";
npm update && npm install && npm outdated;

echo "update polyfills/smoothscroll";
cd "$current_dir/polyfills/smoothscroll/";
npm update && npm install && npm outdated;

echo "update polyfills/~html5-elements";
cd "$current_dir/polyfills/~html5-elements/";
npm update && npm install && npm outdated;
