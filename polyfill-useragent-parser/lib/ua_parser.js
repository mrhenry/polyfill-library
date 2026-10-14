module.exports = function useragent_parser(ua) {
	const family = "Other";
	let major;
	let minor;
	let patch;
	let result;
	if (!ua) {
		return {
			family,
			major,
			minor,
			patch
		};
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/525\.18(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "3";
		const minor = "1";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/528\.18(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "4";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/531\.21(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "4";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/532\.9(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "4";
		return { family, major, minor, patch };
	} else if ((result = /(iPod|iPhone|iPad).+AppleWebKit\/532\+/.exec(ua))) {
		const family = "Mobile Safari/WKWebView";
		const major = "5";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/533\.17(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "5";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/534\.12(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "5";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/534\.46(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "5";
		const minor = "1";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/536\.26(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "6";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/537\.51(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "7";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/600\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "8";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/601\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "9";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/601\.5(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "9";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/602\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/602\.2(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/602\.3(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/602\.4(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/603\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/603\.2(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "10";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/604\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "11";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/604\.2(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "11";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/604\.3(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "11";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/604\.5(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "11";
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPhone|iPad).+AppleWebKit\/605\.1(?:\.\d+|) \(KHTML, like Gecko\) Version\/(\d+)\.?(\d+)?\.?(\d+)?.+?Mobile\/\w+\s(Safari)/.exec(
				ua
			))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPhone|iPad).+OS (\d+)_(\d+) like Mac OS X\) AppleWebKit\/605\.1(?:\.\d+|) \(KHTML, like Gecko\) Mobile\/\w+/.exec(
				ua
			))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/605\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "11";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/606\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "12";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/607\.1(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "12";
		const minor = "1";
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPhone|iPad).+AppleWebKit\/608\.2(?:\.\d+|)/.exec(ua))
	) {
		const family = "Mobile Safari/WKWebView";
		const major = "13";
		return { family, major, minor, patch };
	} else if (
		(result = /(GeoEvent Server) (\d+)(?:\.(\d+)(?:\.(\d+)|)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(ArcGIS Pro)(?: (\d+)\.(\d+)\.([^ ]+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /ArcGIS Client Using WinInet/.exec(ua))) {
		const family = "ArcMap";
		return { family, major, minor, patch };
	} else if (
		(result = /(OperationsDashboard)-(?:Windows)-(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Operations Dashboard for ArcGIS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(arcgisearth)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "ArcGIS Earth";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /com.esri.(earth).phone\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "ArcGIS Earth";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(arcgis-explorer)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Explorer for ArcGIS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /arcgis-(collector|aurora)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Collector for ArcGIS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(arcgis-workforce)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Workforce for ArcGIS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Collector|Explorer|Workforce)-(?:Android|iOS)-(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = "$1 for ArcGIS".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Explorer|Collector)\/(\d+) CFNetwork/.exec(ua))) {
		const family = "$1 for ArcGIS".replace("$1", result[1]);
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result =
			/ArcGISRuntime-(Android|iOS|NET|Qt)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "ArcGIS Runtime SDK for $1".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/ArcGIS\.?(iOS|Android|NET|Qt)(?:-|\.)(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "ArcGIS Runtime SDK for $1".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /ArcGIS\.Runtime\.(Qt)\.(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "ArcGIS Runtime SDK for $1".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(Luminary)[Stage]+\/(\d+) CFNetwork/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result = /(ESPN)[%20| ]+Radio\/(\d+)\.(\d+)\.(\d+) CFNetwork/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Antenna)\/(\d+) CFNetwork/.exec(ua))) {
		const family = "AntennaPod";
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /(TopPodcasts)Pro\/(\d+) CFNetwork/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result = /(MusicDownloader)Lite\/(\d+)\.(\d+)\.(\d+) CFNetwork/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(.{0,200})-iPad\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|) CFNetwork/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(.{0,200})-iPhone\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|) CFNetwork/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(.{0,200})\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|) CFNetwork/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(Luminary)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(espn\.go)/.exec(ua))) {
		const family = "ESPN";
		return { family, major, minor, patch };
	} else if ((result = /(espnradio\.com)/.exec(ua))) {
		const family = "ESPN";
		return { family, major, minor, patch };
	} else if ((result = /ESPN APP$/.exec(ua))) {
		const family = "ESPN";
		return { family, major, minor, patch };
	} else if ((result = /(audioboom\.com)/.exec(ua))) {
		const family = "AudioBoom";
		return { family, major, minor, patch };
	} else if ((result = / (Rivo) RHYTHM/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(CFNetwork)(?:\/(\d+)\.(\d+)(?:\.(\d+)|)|)/.exec(ua))) {
		const family = "CFNetwork";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Pingdom\.com_bot_version_)(\d+)\.(\d+)/.exec(ua))) {
		const family = "PingdomBot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(PingdomTMS)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "PingdomBot";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(PingdomPageSpeed)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "PingdomBot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = / (PTST)\/(\d+)(?:\.(\d+)|)$/.exec(ua))) {
		const family = "WebPageTest.org bot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /X11; (Datanyze); Linux/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(NewRelicPinger)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "NewRelicPingerBot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(RuxitSynthetic)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Ruxit Synthetic";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Tableau)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Tableau";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/AppleWebKit\/\d{1,10}\.\d{1,10}.{0,200} Safari.{0,200} (CreativeCloud)\/(\d+)\.(\d+).(\d+)/.exec(
				ua
			))
	) {
		const family = "Adobe CreativeCloud";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Salesforce)(?:.)\/(\d+)\.(\d?)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(\(StatusCake\))/.exec(ua))) {
		const family = "StatusCakeBot";
		return { family, major, minor, patch };
	} else if ((result = /(facebookexternalhit)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "FacebookBot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /Google.{0,50}\/\+\/web\/snippet/.exec(ua))) {
		const family = "GooglePlusBot";
		return { family, major, minor, patch };
	} else if ((result = /via ggpht\.com GoogleImageProxy/.exec(ua))) {
		const family = "GmailImageProxy";
		return { family, major, minor, patch };
	} else if (
		(result =
			/YahooMailProxy; https:\/\/help\.yahoo\.com\/kb\/yahoo-mail-proxy-SLN28749\.html/.exec(
				ua
			))
	) {
		const family = "YahooMailProxy";
		return { family, major, minor, patch };
	} else if ((result = /(Twitterbot)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Twitterbot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\/((?:Ant-|)Nutch|[A-z]+[Bb]ot|[A-z]+[Ss]pider|Axtaris|fetchurl|Isara|ShopSalad|Tailsweep)[ \-](\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\b(008|Altresium|Argus|BaiduMobaider|BoardReader|DNSGroup|DataparkSearch|EDI|Goodzer|Grub|INGRID|Infohelfer|LinkedInBot|LOOQ|Nutch|OgScrper|Pandora|PathDefender|Peew|PostPost|Steeler|Twitterbot|VSE|WebCrunch|WebZIP|Y!J-BR[A-Z]|YahooSeeker|envolk|sproose|wminer)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(MSIE) (\d+)\.(\d+)([a-z]\d|[a-z]|);.{0,200} MSIECrawler/.exec(
			ua
		))
	) {
		const family = "MSIECrawler";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(DAVdroid)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Google-HTTP-Java-Client|Apache-HttpClient|PostmanRuntime|Go-http-client|scalaj-http|http%20client|Python-urllib|HttpMonitor|TLSProber|WinHTTP|JNLP|okhttp|aihttp|reqwest|axios|unirest-(?:java|python|ruby|nodejs|php|net))(?:[ /](\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Pinterest(?:bot|))\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)[;\s(]+\+https:\/\/www.pinterest.com\/bot.html/.exec(
				ua
			))
	) {
		const family = "Pinterestbot";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(CSimpleSpider|Cityreview Robot|CrawlDaddy|CrawlFire|Finderbots|Index crawler|Job Roboter|KiwiStatus Spider|Lijit Crawler|QuerySeekerSpider|ScollSpider|Trends Crawler|USyd-NLP-Spider|SiteCat Webbot|BotName\/\$BotVersion|123metaspider-Bot|1470\.net crawler|50\.nu|8bo Crawler Bot|Aboundex|Accoona-[A-z]{1,30}-Agent|AdsBot-Google(?:-[a-z]{1,30}|)|altavista|AppEngine-Google|archive.{0,30}\.org_bot|archiver|Ask Jeeves|[Bb]ai[Dd]u[Ss]pider(?:-[A-Za-z]{1,30})(?:-[A-Za-z]{1,30}|)|bingbot|BingPreview|blitzbot|BlogBridge|Bloglovin|BoardReader Blog Indexer|BoardReader Favicon Fetcher|boitho.com-dc|BotSeer|BUbiNG|\b\w{0,30}favicon\w{0,30}\b|\bYeti(?:-[a-z]{1,30}|)|Catchpoint(?: bot|)|[Cc]harlotte|Checklinks|clumboot|Comodo HTTP\(S\) Crawler|Comodo-Webinspector-Crawler|ConveraCrawler|CRAWL-E|CrawlConvera|Daumoa(?:-feedfetcher|)|Feed Seeker Bot|Feedbin|findlinks|Flamingo_SearchEngine|FollowSite Bot|furlbot|Genieo|gigabot|GomezAgent|gonzo1|(?:[a-zA-Z]{1,30}-|)Googlebot(?:-[a-zA-Z]{1,30}|)|GoogleOther|Google SketchUp|grub-client|gsa-crawler|heritrix|HiddenMarket|holmes|HooWWWer|htdig|ia_archiver|ICC-Crawler|Icarus6j|ichiro(?:\/mobile|)|IconSurf|IlTrovatore(?:-Setaccio|)|InfuzApp|Innovazion Crawler|InternetArchive|IP2[a-z]{1,30}Bot|jbot\b|KaloogaBot|Kraken|Kurzor|larbin|LEIA|LesnikBot|Linguee Bot|LinkAider|LinkedInBot|Lite Bot|Llaut|lycos|Mail\.RU_Bot|masscan|masidani_bot|Mediapartners-Google|Microsoft .{0,30} Bot|mogimogi|mozDex|MJ12bot|msnbot(?:-media {0,2}|)|msrbot|Mtps Feed Aggregation System|netresearch|Netvibes|NewsGator[^/]{0,30}|^NING|Nutch[^/]{0,30}|Nymesis|ObjectsSearch|OgScrper|Orbiter|OOZBOT|PagePeeker|PagesInventory|PaxleFramework|Peeplo Screenshot Bot|PHPCrawl|PlantyNet_WebRobot|Pompos|Qwantify|Read%20Later|Reaper|RedCarpet|Retreiver|Riddler|Rival IQ|scooter|Scrapy|Scrubby|searchsight|seekbot|semanticdiscovery|SemrushBot|Simpy|SimplePie|SEOstats|SimpleRSS|SiteCon|Slackbot-LinkExpanding|Slack-ImgProxy|Slurp|snappy|Speedy Spider|Squrl Java|Stringer|TheUsefulbot|ThumbShotsBot|Thumbshots\.ru|Tiny Tiny RSS|Twitterbot|WhatsApp|URL2PNG|Vagabondo|VoilaBot|^vortex|Votay bot|^voyager|WASALive.Bot|Web-sniffer|WebThumb|WeSEE:[A-z]{1,30}|WhatWeb|WIRE|WordPress|Wotbox|www\.almaden\.ibm\.com|Xenu(?:.s|) Link Sleuth|Xerka [A-z]{1,30}Bot|yacy(?:bot|)|YahooSeeker|Yahoo! Slurp|Yandex\w{1,30}|YodaoBot(?:-[A-z]{1,30}|)|YottaaMonitor|Yowedo|^Zao|^Zao-Crawler|ZeBot_www\.ze\.bz|ZooShot|ZyBorg|ArcGIS Hub Indexer|GPTBot|Google-InspectionTool)(?:[ /]v?(\d+)(?:\.(\d+)(?:\.(\d+)|)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\b(Boto3?|JetS3t|aws-(?:cli|sdk-(?:cpp|go|go-v\d|java|nodejs|ruby2?|dotnet-(?:\d{1,2}|core)))|s3fs)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(FME)\/(\d+\.\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(QGIS)\/(\d)\.?0?(\d{1,2})\.?0?(\d{1,2})/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(JOSM)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Tygron Platform) \((\d+)\.(\d+)\.(\d+(?:\.\d+| RC \d+\.\d+))/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\[(FBAN\/MessengerForiOS|FB_IAB\/MESSENGER);FBAV\/(\d+)(?:\.(\d+)(?:\.(\d+)(?:\.(\d+)|)|)|)/.exec(
				ua
			))
	) {
		const family = "Facebook Messenger";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /\[FB.{0,300};(FBAV)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Facebook";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /\[FB.{0,300};/.exec(ua))) {
		const family = "Facebook";
		return { family, major, minor, patch };
	} else if ((result = /(RecipeRadar)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^.{0,200}?(?:\/[A-Za-z0-9\.]{0,50}|) {0,2}([A-Za-z0-9 \-_\!\[\]:]{0,50}(?:[Aa]rchiver|[Ii]ndexer|[Ss]craper|[Bb]ot|[Ss]pider|[Cc]rawl[a-z]{0,50}))[/ ](\d+)(?:\.(\d+)(?:\.(\d+)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^.{0,200}?((?:[A-Za-z][A-Za-z0-9 -]{0,50}|)[^C][^Uu][Bb]ot)\b(?:(?:[ /]| v)(\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^.{0,200}?((?:[A-z0-9]{1,50}|[A-z\-]{1,50} ?|)(?: the |)(?:[Ss][Pp][Ii][Dd][Ee][Rr]|[Ss]crape|[Cc][Rr][Aa][Ww][Ll])[A-z0-9]{0,50})(?:(?:[ /]| v)(\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(HbbTV)\/(\d+)\.(\d+)\.(\d+) \(/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Chimera|SeaMonkey|Camino|Waterfox)\/(\d+)\.(\d+)\.?([ab]?\d+[a-z]*|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(SailfishBrowser)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Sailfish Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /\[(Pinterest)\/[^\]]{1,50}\]/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Pinterest)(?: for Android(?: Tablet|)|)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(Instagram).(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Instagram) (\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(Flipboard).(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(Flipboard-Briefing).(\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(Onefootball)\/Android.(\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Snapchat)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Twitter for (?:iPhone|iPad)|TwitterAndroid)(?:\/(\d+)\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = "Twitter";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(musical_ly) app_version\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "TikTok";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(musical_ly_)(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "TikTok";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(BytedanceWebview)\/[a-z0-9]+/.exec(ua))) {
		const family = "TikTok";
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(KAKAOTALK)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "KakaoTalk";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Telegram-Android)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Telegram";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Mozilla.{1,200}Mobile.{1,100}(Phantom\/ios|Phantom\/android).(\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = "Phantom";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /Mozilla.{1,100}Mobile.{1,100}(AspiegelBot|PetalBot)/.exec(ua))
	) {
		const family = "Spider";
		return { family, major, minor, patch };
	} else if ((result = /AspiegelBot|PetalBot/.exec(ua))) {
		const family = "Spider";
		return { family, major, minor, patch };
	} else if ((result = /(Firefox)\/(\d+)\.(\d+) Basilisk\/(\d+)/.exec(ua))) {
		const family = "Basilisk";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(PaleMoon)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Pale Moon";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Camoufox) Camoufox (\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Fennec)\/(\d+)\.(\d+)\.?([ab]?\d+[a-z]*)/.exec(ua))) {
		const family = "Firefox Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Fennec)\/(\d+)\.(\d+)(pre)/.exec(ua))) {
		const family = "Firefox Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Fennec)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Firefox Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(?:Mobile|Tablet);.{0,200}(Firefox)\/(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Firefox Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Namoroka|Shiretoko|Minefield)\/(\d+)\.(\d+)\.(\d+(?:pre|))/.exec(ua))
	) {
		const family = "Firefox ($1)".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Firefox)\/(\d+)\.(\d+)(a\d+[a-z]*)/.exec(ua))) {
		const family = "Firefox Alpha";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Firefox)\/(\d+)\.(\d+)(b\d+[a-z]*)/.exec(ua))) {
		const family = "Firefox Beta";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox)-(?:\d+\.\d+|)\/(\d+)\.(\d+)(a\d+[a-z]*)/.exec(ua))
	) {
		const family = "Firefox Alpha";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox)-(?:\d+\.\d+|)\/(\d+)\.(\d+)(b\d+[a-z]*)/.exec(ua))
	) {
		const family = "Firefox Beta";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Namoroka|Shiretoko|Minefield)\/(\d+)\.(\d+)([ab]\d+[a-z]*|)/.exec(ua))
	) {
		const family = "Firefox ($1)".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox).{0,200}Tablet browser (\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "MicroB";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(MozillaDeveloperPreview)\/(\d+)\.(\d+)([ab]\d+[a-z]*|)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(FxiOS)\/(\d+)\.(\d+)(\.(\d+)|)(\.(\d+)|)/.exec(ua))) {
		const family = "Firefox iOS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Flock)\/(\d+)\.(\d+)(b\d+?)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(RockMelt)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Navigator)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Netscape";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Navigator)\/(\d+)\.(\d+)([ab]\d+)/.exec(ua))) {
		const family = "Netscape";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Netscape6)\/(\d+)\.(\d+)\.?([ab]?\d+|)/.exec(ua))) {
		const family = "Netscape";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(MyIBrow)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "My Internet Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(UC? ?Browser|UCWEB|UCMobile|U3)[ /]?(\d+)\.(\d+)\.(\d+)/.exec(
			ua
		))
	) {
		const family = "UC Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Opera Tablet).{0,200}Version\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Opera Mini)(?:\/att|)\/?(\d+|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Opera)\/.{1,100}Opera Mobi.{1,100}Version\/(\d+)\.(\d+)/.exec(
			ua
		))
	) {
		const family = "Opera Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Opera)\/(\d+)\.(\d+).{1,100}Opera Mobi/.exec(ua))) {
		const family = "Opera Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /Opera Mobi.{1,100}(Opera)(?:\/|\s+)(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Opera Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /Opera Mobi/.exec(ua))) {
		const family = "Opera Mobile";
		return { family, major, minor, patch };
	} else if (
		(result = /(Opera)\/9.80.{0,200}Version\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(?:Mobile Safari).{1,300}(OPR)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Opera Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(?:Chrome).{1,300}(OPR)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Opera";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(OPX)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Opera GX";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(OPT)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Opera Touch";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Coast)\/(\d+).(\d+).(\d+)/.exec(ua))) {
		const family = "Opera Coast";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(OPiOS)\/(\d+).(\d+).(\d+)/.exec(ua))) {
		const family = "Opera Mini";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /Chrome\/.{1,200}( MMS)\/(\d+).(\d+).(\d+)/.exec(ua))) {
		const family = "Opera Neon";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(hpw|web)OS\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "webOS Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(luakit)/.exec(ua))) {
		const family = "LuaKit";
		return { family, major, minor, patch };
	} else if ((result = /(Snowshoe)\/(\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Gecko\/\d+ (Lightning)\/(\d+)\.(\d+)\.?((?:[ab]?\d+[a-z]*)|(?:\d*))/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox)\/(\d+)\.(\d+)\.(\d+(?:pre|)) \(Swiftfox\)/.exec(ua))
	) {
		const family = "Swiftfox";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox)\/(\d+)\.(\d+)([ab]\d+[a-z]*|) \(Swiftfox\)/.exec(ua))
	) {
		const family = "Swiftfox";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(rekonq)\/(\d+)\.(\d+)(?:\.(\d+)|) Safari/.exec(ua))) {
		const family = "Rekonq";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /rekonq/.exec(ua))) {
		const family = "Rekonq";
		return { family, major, minor, patch };
	} else if (
		(result = /(conkeror|Conkeror)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Conkeror";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(konqueror)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Konqueror";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(WeTab)-Browser/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(Comodo_Dragon)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Comodo Dragon";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Symphony) (\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /PLAYSTATION 3.{1,200}WebKit/.exec(ua))) {
		const family = "NetFront NX";
		return { family, major, minor, patch };
	} else if ((result = /PLAYSTATION 3/.exec(ua))) {
		const family = "NetFront";
		return { family, major, minor, patch };
	} else if ((result = /(PlayStation Portable)/.exec(ua))) {
		const family = "NetFront";
		return { family, major, minor, patch };
	} else if ((result = /(PlayStation Vita)/.exec(ua))) {
		const family = "NetFront NX";
		return { family, major, minor, patch };
	} else if (
		(result = /AppleWebKit.{1,200} (NX)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "NetFront NX";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Nintendo 3DS)/.exec(ua))) {
		const family = "NetFront NX";
		return { family, major, minor, patch };
	} else if ((result = /(HuaweiBrowser)\/(\d+)\.(\d+)\.(\d+)\.\d+/.exec(ua))) {
		const family = "Huawei Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AVG)\/(\d+)\.(\d+)\.(\d+)\.\d+/.exec(ua))) {
		const family = "AVG";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(AvastSecureBrowser|Avast)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Avast Secure Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Instabridge)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(AlohaBrowser|ABB)\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Aloha Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/((?:B|b)rave(?:\sChrome)?)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = "Brave";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(?:\()?Brave(?:\))?\s*$/.exec(ua))) {
		const family = "Brave";
		return { family, major, minor, patch };
	} else if ((result = /(Silk)\/(\d+)\.(\d+)(?:\.([0-9\-]+)|)/.exec(ua))) {
		const family = "Amazon Silk";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Puffin)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /Windows Phone .{0,200}(Edge)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Edge Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(EdgiOS|EdgA)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = "Edge Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(OculusBrowser)\/(\d+)\.(\d+)(?:\.([0-9\-]+)|)/.exec(ua))
	) {
		const family = "Oculus Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(SamsungBrowser)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Samsung Internet";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(SznProhlizec)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Seznam prohlížeč";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(coc_coc_browser)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Coc Coc";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(MxBrowser)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Maxthon";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Crosswalk)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Line)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "LINE";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(MiuiBrowser)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "MiuiBrowser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Mint Browser)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Mint Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(TopBuzz)\/(\d+).(\d+).(\d+)/.exec(ua))) {
		const family = "TopBuzz";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /Mozilla.{1,200}Android.{1,200}(GSA)\/(\d+)\.(\d+)\.(\d+)/.exec(
			ua
		))
	) {
		const family = "Google";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(baidubrowser)[/\s](\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Baidu Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(FlyFlow|flyflow|baiduboxapp)\/(\d+)\.(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = "Baidu Explorer";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(MQQBrowser\/Mini)(?:(\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(ua))
	) {
		const family = "QQ Browser Mini";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(MQQBrowser)(?:\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(ua))
	) {
		const family = "QQ Browser Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(QQBrowser)(?:\/(\d+)(?:\.(\d+)\.(\d+)(?:\.(\d+)|)|)|)/.exec(ua))
	) {
		const family = "QQ Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /Mozilla.{1,200}Mobile.{1,100}(DuckDuckGo)\/(\d+)/.exec(ua))
	) {
		const family = "DuckDuckGo Mobile";
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /Mozilla.{1,200}(DuckDuckGo)\/(\d+)/.exec(ua))) {
		const family = "DuckDuckGo";
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result = /Mozilla.{1,200}Mobile.{1,100}(Ddg)\/(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "DuckDuckGo Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /Mozilla.{1,200}(Ddg)\/(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "DuckDuckGo";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Tenta\/)(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Tenta Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Ecosia) ios@(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Ecosia iOS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Ecosia) android@(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = "Ecosia Android";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(VivoBrowser)\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(H[Ii]Browser)\/v(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "HiBrowser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(HonorBrowser)\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Honor Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(bdhonorbrowser)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Honor Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(HeyTapBrowser)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "HeyTap Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(weibo)__(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Weibo";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(WeiboliteiOS|WeiboIntliOS)/.exec(ua))) {
		const family = "Weibo";
		return { family, major, minor, patch };
	} else if ((result = /(PHX)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Phoenix Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /Version\/.{1,300}(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Chrome Mobile WebView";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /; wv\).{1,300}(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Chrome Mobile WebView";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(CrMo)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Chrome Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(CriOS)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Chrome Mobile iOS";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+) Mobile(?:[ /]|$)/.exec(ua))
	) {
		const family = "Chrome Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = / Mobile .{1,300}(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Chrome Mobile";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(chromeframe)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Chrome Frame";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(SLP Browser)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Tizen Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(SE 2\.X) MetaSr (\d+)\.(\d+)/.exec(ua))) {
		const family = "Sogou Explorer";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Rackspace Monitoring)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "RackspaceBot";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(PRTG Network Monitor)/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(PyAMF)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(YaBrowser)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Yandex Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(YaSearchBrowser)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Yandex Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Chrome)\/(\d+)\.(\d+)\.(\d+).{0,100} MRCHROME/.exec(ua))
	) {
		const family = "Mail.ru Chromium Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AOL) (\d+)\.(\d+); AOLBuild (\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(PodCruncher|Downcast)[ /]?(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = / (BoxNotes)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Whale)\/(\d+)\.(\d+)\.(\d+)\.(\d+) Mobile(?:[ /]|$)/.exec(ua))
	) {
		const family = "Whale";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Whale)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Whale";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(1Password)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Ghost)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/PAN (GlobalProtect)\/(\d+)\.(\d+)\.(\d+) .{1,100} \(X11; Linux x86_64\)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(surveyon)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Surveyon";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(115Browser)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "115 Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Avira)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Avira";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(CCleaner)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "CCleaner";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Norton)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Norton";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Quark)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Quark";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(QuarkPC)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Quark PC";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(SLBrowser)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Smart Lenovo Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Atom)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Atom Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Chrome)\/\d+\.\d+\.\d+\.\d+ .* QIHU 360(?:SEi18n|ENT)/.exec(ua))
	) {
		const family = "360 Secure Browser";
		return { family, major, minor, patch };
	} else if ((result = /(Decentr)/.exec(ua))) {
		const family = "Decentr Web3 Browser";
		return { family, major, minor, patch };
	} else if ((result = /(Sparrow)/.exec(ua))) {
		const family = "Sparrow Browser";
		return { family, major, minor, patch };
	} else if ((result = /(Chromium GOST)/.exec(ua))) {
		const family = "Chromium GOST Browser";
		return { family, major, minor, patch };
	} else if ((result = /(AOLShield)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "AOL Shield Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Hola)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Hola Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(CravingExplorer)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Craving Explorer Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Talon)/.exec(ua))) {
		const family = "Talon Cyber Security Browser";
		return { family, major, minor, patch };
	} else if ((result = /(Qaxbrowser)/.exec(ua))) {
		const family = "QAX Browser";
		return { family, major, minor, patch };
	} else if ((result = /(ADG)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "AOL Desktop Gold Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(SberBrowser)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Sber Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(JiSu)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "JiSu Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Wolvic)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Wolvic Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Thano)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "SmartTV WebBrowser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(MicroMessenger)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "WeChat Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Odin)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Odin";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Colt)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "NetCast Smart TV";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Lite Browser)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Lite Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(OMI)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Vewd Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Mypal)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Mypal Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Chesscom-Android)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(RobloxApp)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Roblox App";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Roadrunner)\/IOS\/\d+\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(AncestryAndroid)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Slack_SSB)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Slack Desktop Client";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(HipChat)\/?(\d+|)/.exec(ua))) {
		const family = "HipChat Desktop Client";
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\b(MobileIron|FireWeb|Jasmine|ANTGalio|Midori|Fresco|Lobo|PaleMoon|Maxthon|Lynx|OmniWeb|Dillo|Camino|Demeter|Fluid|Fennec|Epiphany|Shiira|Sunrise|Spotify|Flock|Netscape|Lunascape|WebPilot|NetFront|Netfront|Konqueror|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|Opera Mini|iCab|NetNewsWire|ThunderBrowse|Iris|UP\.Browser|Bunjalloo|Google Earth|Raven for Mac|Openwave|MacOutlook|Electron|OktaMobile)\/(\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /Microsoft Office Outlook 12\.\d+\.\d+|MSOffice 12/.exec(ua))
	) {
		const family = "Outlook";
		const major = "2007";
		return { family, major, minor, patch };
	} else if ((result = /Microsoft Outlook 14\.\d+\.\d+|MSOffice 14/.exec(ua))) {
		const family = "Outlook";
		const major = "2010";
		return { family, major, minor, patch };
	} else if ((result = /Microsoft Outlook 15\.\d+\.\d+/.exec(ua))) {
		const family = "Outlook";
		const major = "2013";
		return { family, major, minor, patch };
	} else if (
		(result = /Microsoft Outlook (?:Mail )?16\.\d+\.\d+|MSOffice 16/.exec(ua))
	) {
		const family = "Outlook";
		const major = "2016";
		return { family, major, minor, patch };
	} else if ((result = /Microsoft Office (Word) 2014/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /Outlook-Express\/7\.0/.exec(ua))) {
		const family = "Windows Live Mail";
		return { family, major, minor, patch };
	} else if ((result = /(Airmail) (\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Thunderbird)\/(\d+)\.(\d+)(?:\.(\d+(?:pre|))|)/.exec(ua))
	) {
		const family = "Thunderbird";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Postbox)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Postbox";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Barca(?:Pro)?)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Barca";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Lotus-Notes)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = "Lotus Notes";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /Superhuman/.exec(ua))) {
		const family = "Superhuman";
		return { family, major, minor, patch };
	} else if ((result = /(Vivaldi)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /.{0,200}(Teams)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Microsoft Teams";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Edge?)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Edge";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Chrome)\/(\d+)\.(\d+)\.(\d+)[\d.]{0,100} Iron[^/]/.exec(ua))
	) {
		const family = "Iron";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /\b(Dolphin)(?: |HDCN\/|\/INT\-)(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(HeadlessChrome)(?:\/(\d+)\.(\d+)\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Evolution)\/(\d+)\.(\d+)\.(\d+\.\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(RCM CardDAV plugin)\/(\d+)\.(\d+)\.(\d+(?:-dev|))/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(bingbot|Bolt|AdobeAIR|Jasmine|IceCat|Skyfire|Midori|Maxthon|Lynx|Arora|IBrowse|Dillo|Camino|Shiira|Fennec|Phoenix|Flock|Netscape|Lunascape|Epiphany|WebPilot|Opera Mini|Opera|NetFront|Netfront|Konqueror|Googlebot|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|iCab|iTunes|MacAppStore|NetNewsWire|Space Bison|Stainless|Orca|Dolfin|BOLT|Minimo|Tizen Browser|Polaris|Abrowser|Planetweb|ICE Browser|mDolphin|qutebrowser|Otter|QupZilla|MailBar|kmail2|YahooMobileMail|ExchangeWebServices|ExchangeServicesClient|Dragon|Outlook-iOS-Android)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(QtWebEngine)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Qt Web Engine";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(OpenWave)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Open Wave";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AtContent)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Trailer)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Agency)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Herring)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Config)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Viewer)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(LikeWise)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Unique)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(CitizenFX)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(R2Client)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(OBS)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "OBS Studio";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AdobeCEP)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Adobe CEP";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Valve Steam (GameOverlay).{1,200}Chrome\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Steam GameOverlay";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/Valve Steam (Gamepad)\/Steam Deck.{1,200}Chrome\/(\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = "Steam Deck";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Valve(?: Steam|) Client).{1,200}Chrome\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Steam Client";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Ladybird)\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Chromium|Chrome)\/(\d+)\.(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(IEMobile)[ /](\d+)\.(\d+)/.exec(ua))) {
		const family = "IE Mobile";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(BacaBerita App)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(bPod|Pocket Casts|Player FM)$/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result = /^(AlexaMediaPlayer|VLC)\/(\d+)\.(\d+)\.([^.\s]+)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(AntennaPod|WMPlayer|Zune|Podkicker|Radio|ExoPlayerDemo|Overcast|PocketTunes|NSPlayer|okhttp|DoggCatcher|QuickNews|QuickTime|Peapod|Podcasts|GoldenPod|VLC|Spotify|Miro|MediaGo|Juice|iPodder|gPodder|Banshee)\/(\d+)\.(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(Peapod|Liferea)\/([^.\s]+)\.([^.\s]+|)\.?([^.\s]+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(bPod|Player FM) BMID\/(\S+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /^(Podcast ?Addict)\/v(\d+) /.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /^(Podcast ?Addict) /.exec(ua))) {
		const family = "PodcastAddict";
		return { family, major, minor, patch };
	} else if ((result = /(Replay) AV/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(VOX) Music Player/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(CITA) RSS Aggregator\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Pocket Casts)$/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(Player FM)$/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(LG Player|Doppler|FancyMusic|MediaMonkey|Clementine) (\d+)\.(\d+)\.?([^.\s]+|)\.?([^.\s]+|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(philpodder)\/(\d+)\.(\d+)\.?([^.\s]+|)\.?([^.\s]+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Player FM|Pocket Casts|DoggCatcher|Spotify|MediaMonkey|MediaGo|BashPodder)/.exec(
				ua
			))
	) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(QuickTime)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Kinoma)(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /(Fancy) Cloud Music (\d+)\.(\d+)/.exec(ua))) {
		const family = "FancyMusic";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /EspnDownloadManager/.exec(ua))) {
		const family = "ESPN";
		return { family, major, minor, patch };
	} else if (
		(result = /(ESPN) Radio (\d+)\.(\d+)(?:\.(\d+)|) ?(?:rv:(\d+)|) /.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(podracer|jPodder) v ?(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(ZDM)\/(\d+)\.(\d+)[; ]?/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Zune|BeyondPod) (\d+)(?:\.(\d+)|)[\);]/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(WMPlayer)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(Lavf)/.exec(ua))) {
		const family = "WMPlayer";
		return { family, major, minor, patch };
	} else if ((result = /^(RSSRadio)[ /]?(\d+|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /(RSS_Radio) (\d+)\.(\d+)/.exec(ua))) {
		const family = "RSSRadio";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Podkicker) \S+\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Podkicker";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(HTC) Streaming Player \S+ \/ \S+ \/ \S+ \/ (\d+)\.(\d+)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(Stitcher)\/iOS/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /^(Stitcher)\/Android/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /^(VLC) .{0,200}version (\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = / (VLC) for/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(vlc)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "VLC";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(foobar)\S{1,10}\/(\d+)\.(\d+|)\.?([\da-z]+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(Clementine)\S{1,10} (\d+)\.(\d+|)\.?(\d+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(amarok)\/(\d+)\.(\d+|)\.?(\d+|)/.exec(ua))) {
		const family = "Amarok";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Custom)-Feed Reader/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iRider|Crazy Browser|SkipStone|iCab|Lunascape|Sleipnir|Maemo Browser) (\d+)\.(\d+)\.(\d+)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iCab|Lunascape|Opera|Android|Jasmine|Polaris|Microsoft SkyDriveSync|The Bat!) (\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Kindle)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Android) Donut/.exec(ua))) {
		const family = result[1];
		const major = "1";
		const minor = "2";
		return { family, major, minor, patch };
	} else if ((result = /(Android) Eclair/.exec(ua))) {
		const family = result[1];
		const major = "2";
		const minor = "1";
		return { family, major, minor, patch };
	} else if ((result = /(Android) Froyo/.exec(ua))) {
		const family = result[1];
		const major = "2";
		const minor = "2";
		return { family, major, minor, patch };
	} else if ((result = /(Android) Gingerbread/.exec(ua))) {
		const family = result[1];
		const major = "2";
		const minor = "3";
		return { family, major, minor, patch };
	} else if ((result = /(Android) Honeycomb/.exec(ua))) {
		const family = result[1];
		const major = "3";
		return { family, major, minor, patch };
	} else if ((result = /(MSIE) (\d+)\.(\d+).{0,100}XBLWP7/.exec(ua))) {
		const family = "IE Large Screen";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Nextcloud)/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(mirall)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(ownCloud-android)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Owncloud";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(OC)\/(\d+)\.(\d+)\.(\d+)\.(\d+) \(Skype for Business\)/.exec(
			ua
		))
	) {
		const family = "Skype";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(OpenVAS)(?:-VT)?(?:[ \/](\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(
			ua
		))
	) {
		const family = "OpenVAS Scanner";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(AnyConnect)\/(\d+)(?:\.(\d+)(?:\.(\d+)|)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /compatible; monitis/.exec(ua))) {
		const family = "Monitis";
		return { family, major, minor, patch };
	} else if ((result = /(Obigo)InternetBrowser/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(Obigo)\-Browser/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(Obigo|OBIGO)[^\d]*(\d+)(?:.(\d+)|)/.exec(ua))) {
		const family = "Obigo";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(MAXTHON|Maxthon) (\d+)\.(\d+)/.exec(ua))) {
		const family = "Maxthon";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Maxthon|MyIE2|Uzbl|Shiira)/.exec(ua))) {
		const family = result[1];
		const major = "0";
		return { family, major, minor, patch };
	} else if ((result = /(BrowseX) \((\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(NCSA_Mosaic)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "NCSA Mosaic";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(POLARIS)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Polaris";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Embider)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Polaris";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(BonEcho)\/(\d+)\.(\d+)\.?([ab]?\d+|)/.exec(ua))) {
		const family = "Bon Echo";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(TopBuzz) com.alex.NewsMaster\/(\d+).(\d+).(\d+)/.exec(ua))
	) {
		const family = "TopBuzz";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(TopBuzz) com.mobilesrepublic.newsrepublic\/(\d+).(\d+).(\d+)/.exec(ua))
	) {
		const family = "TopBuzz";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(TopBuzz) com.topbuzz.videoen\/(\d+).(\d+).(\d+)/.exec(ua))
	) {
		const family = "TopBuzz";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPhone|iPad).{1,200}GSA\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+)|) Mobile/.exec(
				ua
			))
	) {
		const family = "Google";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPhone|iPad).{1,200}Version\/(\d+)\.(\d+)(?:\.(\d+)|).{1,200}[ +]Safari/.exec(
				ua
			))
	) {
		const family = "Mobile Safari";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPod touch|iPhone|iPad);.{0,30}CPU.{0,30}OS[ +](\d+)_(\d+)(?:_(\d+)|).{0,30} AppleNews\/\d+\.\d+(?:\.\d+|)/.exec(
				ua
			))
	) {
		const family = "Mobile Safari UI/WKWebView";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(iPod|iPhone|iPad).{1,200}Version\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = "Mobile Safari UI/WKWebView";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(iPod|iPod touch|iPhone|iPad).{0,200} Safari/.exec(ua))
	) {
		const family = "Mobile Safari";
		return { family, major, minor, patch };
	} else if ((result = /(iPod|iPod touch|iPhone|iPad)/.exec(ua))) {
		const family = "Mobile Safari UI/WKWebView";
		return { family, major, minor, patch };
	} else if ((result = /(Watch)(\d+),(\d+)/.exec(ua))) {
		const family = "Apple $1 App".replace("$1", result[1]);
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/(Outlook-iOS)\/\d+\.\d+\.prod\.iphone \((\d+)\.(\d+)\.(\d+)\)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AvantGo) (\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(OneBrowser)\/(\d+).(\d+)/.exec(ua))) {
		const family = "ONE Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Avant)/.exec(ua))) {
		const family = result[1];
		const major = "1";
		return { family, major, minor, patch };
	} else if ((result = /(QtCarBrowser)/.exec(ua))) {
		const family = result[1];
		const major = "1";
		return { family, major, minor, patch };
	} else if ((result = /^(iBrowser\/Mini)(\d+).(\d+)/.exec(ua))) {
		const family = "iBrowser Mini";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /^(iBrowser|iRAPP)\/(\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /^(Nokia)/.exec(ua))) {
		const family = "Nokia Services (WAP) Browser";
		return { family, major, minor, patch };
	} else if ((result = /(NokiaBrowser)\/(\d+)\.(\d+).(\d+)\.(\d+)/.exec(ua))) {
		const family = "Nokia Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(NokiaBrowser)\/(\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = "Nokia Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(NokiaBrowser)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Nokia Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(BrowserNG)\/(\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = "Nokia Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Series60)\/5\.0/.exec(ua))) {
		const family = "Nokia Browser";
		const major = "7";
		const minor = "0";
		return { family, major, minor, patch };
	} else if ((result = /(Series60)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Nokia OSS Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(S40OviBrowser)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Ovi Browser";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Nokia)[EN]?(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		return { family, major, minor, patch };
	} else if (
		(result = /(PlayBook).{1,200}RIM Tablet OS (\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "BlackBerry WebKit";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Black[bB]erry|BB10).{1,200}Version\/(\d+)\.(\d+)\.(\d+)/.exec(
			ua
		))
	) {
		const family = "BlackBerry WebKit";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Black[bB]erry)\s?(\d+)/.exec(ua))) {
		const family = "BlackBerry";
		const major = result[2];
		return { family, major, minor, patch };
	} else if ((result = /(OmniWeb)\/v(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Blazer)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Palm Blazer";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Pre)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Palm Pre";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(ELinks)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(ELinks) \((\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Links) \((\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(QtWeb) Internet Browser\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(PhantomJS)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(AppleWebKit)\/(\d+)(?:\.(\d+)|)\+ .{0,200} Safari/.exec(ua))
	) {
		const family = "WebKit Nightly";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(Version)\/(\d+)\.(\d+)(?:\.(\d+)|).{0,100}Safari\//.exec(ua))
	) {
		const family = "Safari";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Safari)\/\d+/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /(OLPC)\/Update(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(OLPC)\/Update()\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = "0";
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(SEMC\-Browser)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Teleca)/.exec(ua))) {
		const family = "Teleca Browser";
		return { family, major, minor, patch };
	} else if ((result = /(Phantom)\/V(\d+)\.(\d+)/.exec(ua))) {
		const family = "Phantom Browser";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Trident)\/(7|8)\.(0)/.exec(ua))) {
		const family = "IE";
		const major = "11";
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Trident)\/(6)\.(0)/.exec(ua))) {
		const family = "IE";
		const major = "10";
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Trident)\/(5)\.(0)/.exec(ua))) {
		const family = "IE";
		const major = "9";
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Trident)\/(4)\.(0)/.exec(ua))) {
		const family = "IE";
		const major = "8";
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Espial)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(AppleWebKit)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Apple Mail";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Firefox)\/(\d+)\.(\d+)(?:\.(\d+)|$)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Firefox)\/(\d+)\.(\d+)(pre|[ab]\d+[a-z]*|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /([MS]?IE) (\d+)\.(\d+)/.exec(ua))) {
		const family = "IE";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(python-requests)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = "Python Requests";
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\b(Windows-Update-Agent|WindowsPowerShell|Microsoft-CryptoAPI|SophosUpdateManager|SophosAgent|Debian APT-HTTP|Ubuntu APT-HTTP|libcurl-agent|libwww-perl|urlgrabber|curl|PycURL|Wget|wget2|aria2|Axel|OpenBSD ftp|lftp|jupdate|insomnia|fetch libfetch|akka-http|got|CloudCockpitBackend|ReactorNetty|axios|Jersey|Vert.x-WebClient|Apache-CXF|Go-CF-client|go-resty|AHC|HTTPie)(?:[ /](\d+)(?:\.(\d+)|)(?:\.(\d+)|)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(cf)\/(\d+)\.(\d+)\.(\S+)/.exec(ua))) {
		const family = "CloudFoundry";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(sap-leonardo-iot-sdk-nodejs) \/ (\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(SAP NetWeaver Application Server) \(1.0;(\d{1})(\d{2})\)/.exec(
			ua
		))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /^(\w+-HTTPClient)\/(\d+)\.(\d+)-(\S+)/.exec(ua))) {
		const family = "HTTPClient";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(go-cli)\s(\d+)\.(\d+).(\S+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(Java-EurekaClient|Java-EurekaClient-Replication|HTTPClient|lua-resty-http)\/v?(\d+)\.(\d+)\.?(\d*)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(ping-service|sap xsuaa|Node-oauth|Site24x7|SAP CPI|JAEGER_SECURITY)/.exec(
				ua
			))
	) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result = /(Python\/3\.\d{1,3} aiohttp)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))
	) {
		const family = "Python aiohttp";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /(Java)[/ ]?\d{1}\.(\d+)\.(\d+)[_-]*([a-zA-Z0-9]+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Java)[/ ]?(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(minio-go)\/v(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(ureq)[/ ](\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(http\.rb)\/(\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(GuzzleHttp)\/(\d+)\.(\d+).(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(grab)\b/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result = /^(Cyberduck)\/(\d+)\.(\d+)\.(\d+)(?:\.\d+|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result =
			/^(S3 Browser) (\d+)[.-](\d+)[.-](\d+)(?:\s*https?:\/\/s3browser\.com|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(S3Gof3r)/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if (
		(result =
			/\b(ibm-cos-sdk-(?:core|java|js|python))\/(\d+)\.(\d+)(?:\.(\d+)|)/.exec(
				ua
			))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(rusoto)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(rclone)\/v(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /^(Roku)\/DVP-(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if ((result = /(Kurio)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = "Kurio App";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /^(Box(?: Sync)?)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if (
		(result = /^(ViaFree|Viafree)-(?:tvOS-)?[A-Z]{2}\/(\d+)\.(\d+)\.(\d+)/.exec(
			ua
		))
	) {
		const family = "ViaFree";
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Transmit)\/(\d+)\.(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Download Master)/.exec(ua))) {
		const family = result[1];
		return { family, major, minor, patch };
	} else if ((result = /\b(HTTrack) (\d+)\.(\d+)(?:[\.\-](\d+)|)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	} else if ((result = /(Ladybird)\/(\d+)\.(\d+)/.exec(ua))) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		return { family, major, minor, patch };
	} else if (
		(result = /(MullvadBrowser)\/(\d+)(?:\.(\d+)|)(?:\.(\d+)|)/.exec(ua))
	) {
		const family = result[1];
		const major = result[2];
		const minor = result[3];
		const patch = result[4];
		return { family, major, minor, patch };
	}
	return {
		family,
		major,
		minor,
		patch
	};
};
