set -e

current_dir=$(pwd)

echo "installing polyfills/AbortController";
cd "$current_dir/polyfills/AbortController/";
npm ci;

echo "installing polyfills/ArrayBuffer";
cd "$current_dir/polyfills/ArrayBuffer/";
npm ci;

echo "installing polyfills/AudioContext";
cd "$current_dir/polyfills/AudioContext/";
npm ci;

echo "installing polyfills/HTMLPictureElement";
cd "$current_dir/polyfills/HTMLPictureElement/";
npm ci;

echo "installing polyfills/HTMLTemplateElement";
cd "$current_dir/polyfills/HTMLTemplateElement/";
npm ci;

echo "installing polyfills/Intl";
cd "$current_dir/polyfills/Intl/";
npm ci;

echo "installing polyfills/MutationObserver";
cd "$current_dir/polyfills/MutationObserver/";
npm ci;

echo "installing polyfills/ResizeObserver";
cd "$current_dir/polyfills/ResizeObserver/";
npm ci;

echo "installing polyfills/String/prototype/normalize";
cd "$current_dir/polyfills/String/prototype/normalize/";
npm ci;

echo "installing polyfills/URL";
cd "$current_dir/polyfills/URL/";
npm ci;

echo "installing polyfills/UserTiming";
cd "$current_dir/polyfills/UserTiming/";
npm ci;

echo "installing polyfills/WebAnimations";
cd "$current_dir/polyfills/WebAnimations/";
npm ci;

echo "installing polyfills/_IteratorHelpers";
cd "$current_dir/polyfills/_IteratorHelpers/";
npm ci;

echo "installing polyfills/atob";
cd "$current_dir/polyfills/atob/";
npm ci;

echo "installing polyfills/smoothscroll";
cd "$current_dir/polyfills/smoothscroll/";
npm ci;

echo "installing polyfills/~html5-elements";
cd "$current_dir/polyfills/~html5-elements/";
npm ci;
