
document.getElementById('signIn').addEventListener('click', ({target}) => {
	window.location.replace('./popup-sign-in.html');
});

document.getElementById('updateUserAgent').addEventListener('click', ({target}) => {
	const value = document.getElementById('ua').value;
	const cmd = target.dataset.cmd;
	if(cmd == 'update'){
		chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
			
			chrome.tabs.sendMessage(tabs[0].id, {
				method: 'updateUserAgent',
				value
			},function(response){
			});
			
			chrome.runtime.sendMessage({
				method: 'updateUserAgent',
				value
			},function(response){
			});
		});
		
	}
});

