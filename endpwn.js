/*
 * --- credits ---
 * dr1ft - major EndPwn work, 95% of all code
 * block - EndPwn2 maintaining and additions
 * leovoel - BeautifulDiscord CSS injection
 * Memework(tm) - Discord datamining
 */

var epver = 2.016;
var silent = false;
var browser = false;

if (typeof(DiscordNative) != "undefined") {
	if (typeof(require) === "undefined") {
		require=(x)=>(DiscordNative.nativeModules.requireModule("discord_/../electron").remote.require(x)); electron = DiscordNative.nativeModules.requireModule("discord_/../electron").remote;
	} else {
		var electron = require("electron").remote;
	}
}
else {
	browser = true;
	throw "- Not in a Discord client, stopping endpwn.js execution.";
}


var remote = electron;
var __fs = require("fs");
var _fs = require("original-fs");
var Buffer = require("buffer").Buffer;

var _win = electron.getCurrentWindow();

var cacheclear = function () {
    _win.webContents.session.clearCache(function(){});
}

var uninstall = function () {
	if (confirm("This will uninstall EndPwn and remove it's injections. Are you sure?", "EndPwn"))
	{
		localStorage.removeItem("ran");
		eplog("Reverting endpoint injection...");
		endpoint_restore();
		eplog("Reverting asar injection...");
		asarunpwn();
		if (confirm("Copy /lib, /plugins, and /style to the desktop?", "EndPwn"))
		{
			eplog("Archiving /lib, /plugins, and /style...");
			copyExtrasToDesktop();
		}
		if (confirm("This will remove all custom stylesheets and plugins you have left! Are you sure?", "EndPwn"))
		{
			eplog("Deleting /endpwn directory...");
			deleteFolderRecursive(data() + '/endpwn');
		}
		setTimeout(function(){electron.app.relaunch();electron.app.quit();}, 1500);
	}
}

//stolen from stackoverflow and slightly modified from SharpCoder
var deleteFolderRecursive = function(path) {
	if (_fs.existsSync(path)) {
		_fs.readdirSync(path).forEach(function(file){
		var curPath = path + "/" + file;
		if (_fs.lstatSync(curPath).isDirectory()) { deleteFolderRecursive(curPath); } // recurse
			else { _fs.unlinkSync(curPath); } // delete file
		});
		if (_fs.readdirSync(path).length == 0) { _fs.rmdirSync(path); }
	}
};

var copyExtrasToDesktop = function() {
	var desktop = require('path').join(require('os').homedir(), 'Desktop');
	try{ _fs.mkdirSync(desktop + '/endpwn_backup/'); } catch(e){ eplog("Failed to create root backup folder! Aborting!"); return; }
	try{ _fs.mkdirSync(desktop + '/endpwn_backup/' + 'lib/'); } catch(e){ eplog("Failed to create lib/ backup folder! Aborting!"); return; }
	try{ _fs.mkdirSync(desktop + '/endpwn_backup/' + 'plugins/'); } catch(e){ eplog("Failed to create plugins/ backup folder! Aborting!"); return; }
	try{ _fs.mkdirSync(desktop + '/endpwn_backup/' + 'styles/'); } catch(e){ eplog("Failed to create styles/ backup folder! Aborting!"); return; }
	_fs.readdirSync(_epdata + 'lib/').forEach(function(file) { _fs.createReadStream(_epdata + 'lib/' + file).pipe(_fs.createWriteStream(desktop + '/endpwn_backup/lib/' + file)); });
	_fs.readdirSync(_epdata + 'plugins/').forEach(function(file) { _fs.createReadStream(_epdata + 'plugins/' + file).pipe(_fs.createWriteStream(desktop + '/endpwn_backup/plugins/' + file)); });
	_fs.readdirSync(_epdata + 'styles/').forEach(function(file) { _fs.createReadStream(_epdata + 'styles/' + file).pipe(_fs.createWriteStream(desktop + '/endpwn_backup/styles/' + file)); });
}

var cleanup = function () {
	var dir = approot().split('app.asar')[0].replace(/\\/g,"/");
    document.head = document.createElement('head');
    document.body = document.createElement('body');
	electron.getCurrentWindow().loadURL(`https://${(dir.toLowerCase().indexOf("discordcanary") > -1 && "canary.") || (dir.toLowerCase().indexOf("discordptb") > -1 && "ptb.") || ""}discordapp.com/channels/@me`);
}

var _discord_branch = "Discord";
var _discord_version = "app-0.0.000";
remote.app.getAppPath().split('\\').forEach(function(file) { if (file.indexOf("iscord") !== -1) {_discord_branch = file}; if (file.indexOf("app-") !== -1) { _discord_version = file.substring(4)}; });

var setup = function () {
	localStorage.setItem("ran", "true");
    cacheclear();
	
	if(typeof(betterDiscordIPC)!="undefined") { eplog("It seems you have an install of BetterDiscord. Uninstall it before you install EndPwn2."); return; }
	if(typeof(_cynergy_ver)!="undefined") { eplog(`It seems you have an install of Cynergy. Uninstall it before you install EndPwn2.\nhint: replace %appdata%\\${_discord_branch.toLowerCase()}\\app-${_discord_version}\\modules\\discord_desktop_core\\core.asar with the one in\n%localappdata%\\${_discord_branch}\\app-${_discord_version}\\resources\\bootstrap\\discord_desktop_core.zip to rid the autorun code.\nDelete the folder, too.`); return; }
	if(typeof(injected)!="undefined") { eplog("It seems you have a bootsyhax-based modification installed. Uninstall it before you install EndPwn2."); return; }
	
    var a = navigator.appVersion;
    var v = a.substring(a.indexOf('discord/')).split('/')[1].split(' ')[0];
	setTimeout(function () {
		if (typeof(_epver) == "undefined")
		{
            eplog("EndPwn is not installed.");
            
            try{
                asarpwn2();
            }catch(e){
                eplog(`asarpwn2 failed: ${e}\nEndPwn may already be installed, continuing...`);
            }
		}
        else {
            if (_epver == epver) {
                eplog("EndPwn is up to date, continuing to Discord.");
                cleanup();
                return;
            }
			else { eplog(`New EndPwn update: v${epver}, applying...`); }
        }

		eplog("Injecting WEBAPP_ENDPOINT override into settings.json...");
		try { endpoint_setup(); }
        catch(e) { eplog("Endpoint injection failed, continuing..."); }

        eplog("Dropping files...");
        dropfiles();
		eplog("Restarting Discord in 2.5 seconds...");
		setTimeout(crash, 2500);
	}, 1500);
}

var endpoint_setup = function () {
	var settings = JSON.parse(_fs.readFileSync(settingsjson(), "UTF8"));
	if (silent) { settings.WEBAPP_ENDPOINT = "file:///" + _epdata + "#silent"; }
	else { settings.WEBAPP_ENDPOINT = "file:///" + _epdata; }
	_fs.writeFileSync(settingsjson(), JSON.stringify(settings));
};

var endpoint_restore = function () {
	var settings = JSON.parse(_fs.readFileSync(settingsjson(), "UTF8"));
	delete settings.WEBAPP_ENDPOINT;
	_fs.writeFileSync(settingsjson(), JSON.stringify(settings));
};

function asarinject(sig, inj) {
	var dirlisting = _fs.readdirSync(data());
    var latestver = dirlisting.filter(d=>d.indexOf("0.0.") > -1);
	
    if (sig.length != inj.length) {
        throw 'signature and injection not same size'
    }
    var bdata = new Buffer(_fs.readFileSync(`${data()}/${latestver[latestver.length-1]}/modules/discord_desktop_core/core.asar`));
    var index = bdata.indexOf(sig);
    if (index == -1) {
        //patched or already modified, continue
		return;
    }
    bdata.write(inj, index);
    _fs.writeFileSync(`${data()}/${latestver[latestver.length-1]}/modules/discord_desktop_core/core.asar`, bdata);
}

var asarpwn2 = function() {
	eplog("Injecting dom-ready listener into app.asar...");
	
	asarinject('nodeIntegration: false,',
			   'nodeIntegration:  true,');
	asarinject("// Prevent navigation when links or files are dropping into the app, turning it into a browser.\n  // https://github.com/discordapp/discord/pull/278",
			   "// endpwn <3\r\n  mainWindow.webContents.on('dom-ready', function () {require('../../../../../endpwn/i.js').x(mainWindow)}); //this makes endpwn work");
};

var asarunpwn = function() {
    eplog("Undoing asarpwn...");
	
	asarinject('nodeIntegration:  true,',
			   'nodeIntegration: false,');
	asarinject("// endpwn <3\r\n  mainWindow.webContents.on('dom-ready', function () {require('../../../../../endpwn/i.js').x(mainWindow)}); //this makes endpwn work",
			   "// Prevent navigation when links or files are dropping into the app, turning it into a browser.\n  // https://github.com/discordapp/discord/pull/278");
}

var data = function () {
    return remote.app.getPath('userData') + "/";
}

var approot = function () {
    return asar() + "/../";
}

var settingsjson = function () {
    return data() + 'settings.json';
}

var asar = function () {
    return remote.app.getAppPath();
}

var dropfiles = function () {
    if (!_fs.existsSync(data() + '/endpwn')){
        _fs.mkdirSync(data() + '/endpwn');
    }
    if (!_fs.existsSync(data() + '/endpwn/styles')){
        _fs.mkdirSync(data() + '/endpwn/styles');
    }
    if (!_fs.existsSync(data() + '/endpwn/plugins')){
        _fs.mkdirSync(data() + '/endpwn/plugins');
    }
    if (!_fs.existsSync(data() + '/endpwn/lib')){
        _fs.mkdirSync(data() + '/endpwn/lib');
    }

    var license = 'BeautifulDiscord\n\nThe MIT License (MIT)\n\nCopyright (c) 2016 leovoel\n\nPermission is hereby granted, free of charge, to any person obtaining a\ncopy of this software and associated documentation files (the "Software"),\nto deal in the Software without restriction, including without limitation\nthe rights to use, copy, modify, merge, publish, distribute, sublicense,\nand/or sell copies of the Software, and to permit persons to whom the\nSoftware is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS\nOR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\nFROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER\nDEALINGS IN THE SOFTWARE.';

    //   blob of bullshit for i.js start
    // imports/helper definitions
    var ec = `var fs=require("original-fs");var el=require("electron").remote;var win=el.getCurrentWindow();var app=el.app;var _epdata="${data().replace(/\\/g,"/")+"endpwn/"}";`;
    // restart function
    var rs = 'var _ep_restart=function(){app.relaunch();app.quit()}';
    // cache clear function
    var cc = 'var _ep_clean=function(){el.getCurrentWindow().webContents.session.clearCache(function(){})}';
    // continue to discord function
    var ct = 'var _ep_continue=function(){win.loadURL("https://canary.discordapp.com/channels/@me")}';
    // bootstrap
    var pl = `var fs=require("original-fs");exports.x=function(win){win.webContents.executeJavaScript('${ec}var _epver=${epver};${rs};${cc};${ct};if(window.location.hostname.includes("discordapp.com")){require(_epdata + "/main")}');}`;
    //   end i.js cyst

    _fs.writeFileSync(data() + '/endpwn/i.js', pl);
    _fs.writeFileSync(data() + '/endpwn/p.js');

    try
    {
        _fs.readFileSync(data() + '/endpwn/autoexec.js');
    }
    catch(e)
    {
        _fs.writeFileSync(data() + '/endpwn/autoexec.js', 'setupCSS(_epdata + "/styles/style.css");\nconsole.log("Hello, world!");');
    }
	
    var eclient = new XMLHttpRequest();
    //eclient.open('GET', 'https://block57.net/discord/epapi.js');
    eclient.open('GET', 'https://endpwn.github.io/epapi.js');
    eclient.onreadystatechange = function() {
        if (eclient.readyState === 4) {
            _fs.writeFileSync(data() + '/endpwn/epapi.js', eclient.responseText);
        }
    }
    eclient.send();
	
    var mclient = new XMLHttpRequest();
    mclient.open('GET', 'https://block57.net/discord/main.js');
    mclient.onreadystatechange = function() {
        _fs.writeFileSync(data() + '/endpwn/main.js', mclient.responseText);
    }
    mclient.send();
	
    var oclient = new XMLHttpRequest();
    oclient.open('GET', 'https://block57.net/discord/offline.html');
    oclient.onreadystatechange = function() {
        _fs.writeFileSync(data() + '/endpwn/app', oclient.responseText);
    }
    oclient.send();
	
    _fs.writeFileSync(data() + '/endpwn/legal.txt', license);
    try{
        _fs.readFileSync(data() + '/endpwn/styles/style.css');
    }catch(e){
        _fs.writeFileSync(data() + '/endpwn/styles/style.css', "/*@import url('https://block57.net/discord/css/all.css');*/\n@import url('https://block57.net/discord/css/animations.css');\n@import url('https://block57.net/discord/css/avatars.css');\n@import url('https://block57.net/discord/css/background.css');\n@import url('https://block57.net/discord/css/channels.css');\n@import url('https://block57.net/discord/css/emoji.css');\n@import url('https://block57.net/discord/css/guilds.css');\n@import url('https://block57.net/discord/css/misc.css');\n@import url('https://block57.net/discord/css/titlebar.css');\n@import url('https://block57.net/discord/css/typinginput.css');\n@import url('https://block57.net/discord/css/variables.css');\n\n/* This file contains the custom CSS edits for EndPwn. If you want to\nchange the way these look, copy in the 'variables.css' file and edit the\nvalues in it. Also, you can select what kinds of edits you want applied\nusing the lines above. Comment out the ones you don't want, or leave them\nall in by uncommenting the 'all.css' file and removing the others. */");
    }
}

var crash = function () {
    remote.app.relaunch();
	remote.app.quit();
};