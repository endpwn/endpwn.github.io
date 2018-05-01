function __krequire(path) {
        return eval('(()=>{var exports={};' + fs.readFileSync(_epdata + path, 'utf8').toString() + ';return exports})()');
}
//get that epapi
var _epapi = __krequire('epapi.js');
//start it up, brand as endpwn
_epapi.go('asarpwn',false,'EndPwn',false);
$api.data += "endpwn/";

$api.discord.toggleDeveloper = function() {
	if (wc.findFunc('isDeveloper')[1].exports.isDeveloper) { wc.findFunc('isDeveloper')[1].exports.__defineGetter__('isDeveloper',()=>false); }
	else { wc.findFunc('isDeveloper')[1].exports.__defineGetter__('isDeveloper',()=>true); }
}
$api.ui.fakeMsg = function (text, func) {
	if (typeof (text) != 'string') { $api.internal.messageUI.receiveMessage(this.getCurrentChannel(), text); return; }
	var msg = $api.internal.messageCreation.createMessage(this.getCurrentChannel(), text);
	msg.author.bot = true;
	msg.author.avatar = 'EndPwn'
	msg.author.username = 'EndPwn';
	msg.author.discriminator = '666';
	msg.author.id = '1';
	msg.author.flags = '63';
	msg.timestamp = new Date().toISOString();
	msg.state = 'SENT';
	if (typeof (func) != 'undefined') { func(msg); }
	$api.internal.messageUI.receiveMessage(this.getCurrentChannel(), msg);
}
$api.ui.createMsg = function (text) {
	var msg = $api.internal.messageCreation.createMessage(this.getCurrentChannel(), text);
	msg.author.bot = true;
	msg.author.avatar = 'EndPwn'
	msg.author.username = 'EndPwn';
	msg.author.discriminator = '666';
	msg.author.id = '1';
	msg.author.flags = '63';
	msg.timestamp = new Date().toISOString();
	msg.state = 'SENT';
	return msg;
}

// beautifuldiscord, used to load css styles
// credit to leovoel
bdwatcher=null,bdtag=null,setupCSS=function(n){var e=fs.readFileSync(n,"utf-8");null===bdtag&&(bdtag=document.createElement("style"),document.head.appendChild(bdtag)),bdtag.innerHTML=e,null===bdwatcher&&(bdwatcher=fs.watch(n,{encoding:"utf-8"},function(e,w){if("change"===e){var i=fs.readFileSync(n,"utf-8");bdtag.innerHTML=i}}))};

// SELF_XSS warning disable (dr1ft)
$api.util.findFuncExports('consoleWarning').consoleWarning = e => { };

// blend the linq.js methods into the array prototype for implicit Enumerable.from()
if (!typeof (Enumerable) == 'undefined')
    for (var k in Enumerable.prototype)
        if (!Array.prototype.hasOwnProperty(k))
            eval('Array.prototype.' + k + '=function(){return Enumerable.prototype.' + k + '.apply(Enumerable.from(this),arguments)}');
// load autoexec.js
try { require(_epdata + "/autoexec") } catch (e) { console.warn("Your autoexec.js file appears to have an error:\n\n" + e) };

// welcome message
window._epabout = function() {
	console.log('%c', 'font-size:1px; line-height:100px; padding:50px 50px; background-size:100px 100px; background-image:url("https://block57.net/discord/endpwn_dark.png");');
	console.log(`EndPwn2 v${_epver} - asarpwn method | EPAPI v${_epapi.version} loaded.\nEndPwn created by quant/dr1ft\nupkeep and additional features by block\nwebcrack.js, asarpwn, and a lot of help from bootsy\nBeautifulDiscord by leovoel`);
}
//_epabout();
window._epmenu = function() { require('electron').remote.getCurrentWindow().loadURL('https://block57.net/discord'); }