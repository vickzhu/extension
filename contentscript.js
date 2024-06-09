function initUA(){
	chrome.storage.local.get({'ua':''}, function(result) {
		const userAgent = result.ua;
		console.log('JavaScript UA: ' + userAgent);
        if(userAgent == '' || userAgent == undefined)return false;
		setupUserAgentHook(userAgent);
    });
}
function setupUserAgentHook(UserAgent){
    function addslashes(str) { // Quote string with slashes
		return str.replace(/([\"\'])/g, "\\$1");
	}
	
	var actualCode = '(' + function(newUserAgent){
		'use strict';
		console.log(123456);
		var navigator = Object.create(window.navigator);
		//var navigator = window.navigator;
		function rTMPL(o){
			return {
				value: o,
				configurable: false,
				enumerable: true,
				writable: false
			}
		}
		
		var ChromeV = newUserAgent.replace(/^.*Chrome\/(\d+).*$/gi,'$1');

		Object.defineProperties(navigator, {
			userAgent: rTMPL(newUserAgent),
			appVersion: rTMPL(newUserAgent),
			platform: rTMPL('Win32'),
			productSub: rTMPL('20030107'),
			language: rTMPL('zh-CN'),
			languages: rTMPL(['zh-CN','zh', 'en']),
			userAgentData: rTMPL({"brands":[{"brand":" Not A;Brand","version":ChromeV},{"brand":"Chromium","version":ChromeV},{"brand":"Google Chrome","version":ChromeV}],"mobile":false}),

			deviceMemory: rTMPL(16), 
			hardwareConcurrency: rTMPL(8),

			maxTouchPoints: rTMPL(0),msMaxTouchPoints: rTMPL(0),
			vendor: rTMPL('Google Inc.'),appCodeName: rTMPL('Mozilla'),appName: rTMPL('Netscape'),product: rTMPL('Gecko'),
			bluetooth: rTMPL({}),clipboard: rTMPL({}),credentials: rTMPL({}),ink: rTMPL({}),keyboard: rTMPL({}),locks: rTMPL({}),mediaCapabilities: rTMPL({}),permissions: rTMPL({}),plugins: rTMPL({}),
			scheduling: rTMPL({}),storage: rTMPL({}),wakeLock: rTMPL({}),webkitPersistentStorage: rTMPL({}),webkitTemporaryStorage: rTMPL({}),windowControlsOverlay: rTMPL({}),
			onLine: rTMPL(true),pdfViewerEnabled: rTMPL(true),cookieEnabled: rTMPL(true),webdriver: rTMPL(false),doNotTrack: rTMPL(null),vendorSub: rTMPL(""),xr: rTMPL("XRSy"),

			mediaDevices: rTMPL({ondevicechange: null}),
			usb: rTMPL({onconnect: null, ondisconnect: null}),
			hid: rTMPL({onconnect: null, ondisconnect: null}),
			managed: rTMPL({onmanagedconfigurationchange: null}),
			serial: rTMPL({onconnect: null, ondisconnect: null}),
			presentation: rTMPL({defaultRequest: null, receiver: null}),
			mediaSession: rTMPL({metadata: null, playbackState: 'none'}),
			userActivation: rTMPL({hasBeenActive: true, isActive: true}),
			virtualKeyboard: rTMPL({boundingRect: DOMRect, overlaysContent: false, ongeometrychange: null}),
			connection: rTMPL({"downlink":10,"effectiveType":"4g","onchange":null,"rtt":50,"saveData":false}),
			serial: rTMPL({controller: null, ready: Promise, oncontrollerchange: null, onmessage: null, onmessageerror: null}),
			geolocation: rTMPL({getCurrentPosition: function(fs,fe,o){fe({code: 1, message: 'User denied Geolocation'})}, watchPosition: function(fs,fe,o){fe({code: 1, message: 'User denied Geolocation'})}}),
			mimeTypes: rTMPL({0: 'MimeType', 1: 'MimeType', 2: 'MimeType', 3: 'MimeType', 'application/pdf': 'MimeType', 'application/x-google-chrome-pdf': 'MimeType', 'application/x-nacl': 'MimeType', 'application/x-pnacl': 'MimeType', 'length': 4})
		});
		Object.defineProperty(window, 'navigator', {
			value: navigator,
			configurable: true,
			enumerable: true,
			writable: true
		});
	} + ')("'+addslashes(UserAgent)+'");';
	//var s = document.createElement('script');
	//s.textContent = actualCode;
	//document.documentElement.prepend(s);
	//s.remove();
	
	document.documentElement.setAttribute('onreset', actualCode);
	document.documentElement.dispatchEvent(new CustomEvent('reset'));
	document.documentElement.removeAttribute('onreset');
}
//方案1
//initUA();

function injectScript (src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    //s.type = "module" // <-- Add this line for ESM module support
    //s.onload = () => s.remove();
    (document.documentElement).prepend(s);
	//(document.head || document.documentElement).prepend(s);
}
//方案2
injectScript('inject.js')

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Received Message: '+request);
	const ua = request.value;
	if (request.method === 'updateUserAgent') {
		console.log(111);
		console.log('ua:' + ua);
		console.log(222);
		sessionStorage.setItem('ua',ua);
		chrome.storage.local.set({
            ua: ua
        });
		//chrome.tabs.query({},function(tabs){
			//for (var i = 0;i < tabs.length;i++) {
				// Inject into the tabs of choice - currently everything.
				//chrome.scripting.executeScript(
				//	injection: code
				//);
			//}
		//});
	}
});
