self.importScripts('network.js');

const network = new Network();

chrome.storage.onChanged.addListener(ps => {
	console.log('Storage Changed :' + ps);
  if (ps.mode || ps.ua) {
    //network.configure();
  }
});

chrome.runtime.onStartup.addListener(() => network.configure());
chrome.runtime.onInstalled.addListener(() => network.configure());

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	let ua = request.value;
	network.configure();
});