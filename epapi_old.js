/*
    ENDPWN API

    If you are reading this, salutations! I dont know why you'd want to use any code from this garbage.
	Don't take it without giving credit. I don't know legal shit, just credit us.
	
	-dr1ft, bootsy, and block
	
    bootsy branch: https://super.fuck.world/epapi.js
    block branch: https://block57.net/discord/channels/@me/epapi.js
*/

// Extension methods and shit ig
window.$ = function (s) {
	return document.querySelector(s)
}

window.$$ = function (s) {
	return document.querySelectorAll(s)
}

window.$_ = function (e,c,t,i) {
	var elm = document.createElement(e);
	if (typeof(c) != 'undefined')
	{
		elm.className = c;
		if (typeof(t) != 'undefined')
		{
			elm.innerText = t;
			if (typeof(i) != 'undefined')
			{
				elm.id = i;
			}
		}
	}
	return elm;
}

window.$purge = function (e) {
	e.innerHTML = '';
}

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
}

Array.prototype.contains = function (s) {
	return this.indexOf(s) != -1;
}

Date.fromSnowflake = (id) => new Date((id / 4194304) + 1420070400000);

// Some internal APIs we use
var internal = {}
var ui = {}
var event = {}

// Base
exports.version = 5.003;
exports.xyzzy = 'Nothing happened.';

exports.go = function () {
	if ($(".guilds-wrapper .guilds") != null) {
		if ($(".guilds-wrapper .guilds").children.length > 0) {
			internal = {
				dispatcher: wc.findFunc('Dispatch')[0].exports,
				evnt: wc.findFunc('MESSAGE_CREATE')[1].exports,
				rmsg: wc.findFunc('receiveMessage')[0].exports,
				cmsg: wc.findFunc('createMessage')[1].exports,
				notf: wc.findFunc('NOTIFICATION_CREATE')[1].exports,
				hguild: wc.findFunc('leaveGuild')[0].exports,
				lguild: wc.findFunc('markGuildAsRead')[0].exports
			};

			// UI
			ui = {
				getCurrentChannel: function () {
					var p = window.location.pathname.split('/');
					return p[p.length - 1];
				},

				getCurrentGuild: function () {
					var p = window.location.pathname.split('/');
					return p[p.length - 2];
				},

				fakeMsg: function (text, func) {
					if (typeof (text) != 'string') { internal.rmsg.receiveMessage(this.getCurrentChannel(), text); return; }
					var msg = internal.cmsg.createMessage(this.getCurrentChannel(), text);
					msg.author.bot = true;
					msg.author.avatar = 'EndPwn'
					msg.author.username = 'EndPwn';
					msg.author.discriminator = '666';
					msg.author.id = '1';
					msg.author.flags = '63';
					msg.timestamp = new Date().toISOString();
					msg.state = 'SENT';
					if (typeof (func) != 'undefined') { func(msg); }
					internal.rmsg.receiveMessage(this.getCurrentChannel(), msg);
				},

				hideChannels: function () {
					$('.channels-wrap').style.display = 'none';
				},

				showChannels: function () {
					$('.channels-wrap').style.display = '';
				},

				hideServers: function () {
					$('.guilds-wrapper').style.display = 'none';
				},

				showServers: function () {
					$('.guilds-wrapper').style.display = '';
				},

				hideToolbar: function () {
					$('.topic').style.display = 'none';
					$('.header-toolbar').style.display = 'none';
				},

				showToolbar: function () {
					$('.topic').style.display = '';
					$('.header-toolbar').style.display = '';
				},

				toggleUsers: function () {
					wc.findFunc('toggleSection')[1].exports.TOGGLE_USERS.action()
				},
				
				showDialog: function (x) { wc.findFunc('e.onConfirmSecondary')[1].exports.show(x); },
				/* for example, 
				$api.ui.showDialog({title: 'title', body: 'body', confirmText: 'confirm', cancelText: 'cancel', 
				onConfirm: console.log, onCancel: console.log, iconUrl: 'dunno', minorText: 'minor', onConfirmSecondary: console.log, className: 'endpwn'})
				*/
				
				showNotice: function (text,button,type,callback) { 
					var tipe = "GENERIC";
					if (type != undefined) {tipe = type;}
					wc.findFunc('NOTICE_SHOW')[2].exports.show(tipe,text,button,console.log,0);
				}
			}

			// Events
			event = {
				discordNativeEvent: function (e) {
					return new CustomEvent('ep-native', { detail: e });
				},
				onReady: function () {
					return new Event('ep-ready');
				},
				onChannelChange: function (e) {
					return new CustomEvent('ep-onchannelchange', { detail: e.detail });
				},
				onMessage: function (e) {
					return new CustomEvent('ep-onmessage', { detail: e.detail });
				},
				onChannelMessage: function (e) {
					return new CustomEvent('ep-onchannelmessage', { detail: e.detail });
				}
			}

			$listen('ep-native', (e) => {
				switch (e.detail.type) {
					case 'MESSAGE_CREATE':
						$dispatch(event.onMessage(e));
						break;
					case 'CHANNEL_SELECT':
						$dispatch(event.onChannelChange(e));
						break;
				}
			});

			$listen('ep-onmessage', function (e) {
				if (e.detail.channel_id == $chan()) {
					$dispatch(event.onChannelMessage(e));
				}
			});

			internal.dispatcher.default.register(function (e) {
				$dispatch(event.discordNativeEvent(e));
			})

			// Shorthand shit
			window.$chan = ui.getCurrentChannel;
			window.$guild = ui.getCurrentGuild;

			// Exports
			exports.internal = internal;
			exports.settings = settings;
			exports.ui = ui;
			exports.event = event;

			/===/

			if (fs.existsSync(_epdata + '/lib')) {
                fs.readdirSync(_epdata + '/lib').forEach(function (x) {
                    try {
                        var lib = require(_epdata + '/lib/' + x);
                        global['_lib' + lib.name] = lib;
                    }
                    catch (e) {
                        console.warn(x + ' contains errors.\n\n' + e);
                    }
                });
            }
			if (fs.existsSync(_epdata + '/plugins')) {
				fs.readdirSync(_epdata + '/plugins').forEach(function (x) {
					try {
						require(_epdata + '/plugins/' + x).start();
					}
					catch (e) {
						console.warn(x + ' contains errors.\n\n' + e);
					}
				})};

			setTimeout(function () {
				$dispatch(event.onReady());
			}, 500);

			// This method should never be run again
			exports.go = undefined;
		}
		else {
			console.log("EPAPI loading failed, trying again...");
			setTimeout(exports.go, 100);
		}
	}
	else {
		setTimeout(exports.go, 2000);
	}
}

let appdata = require('electron').remote.app.getPath('userData').replace(/\\/g,"/");

var settings = {
	get: function (k) {
		return JSON.parse(fs.readFileSync(_epdata + '/settings.json', 'utf8'))[k];
	},
	set: function (k, v) {
		var o = JSON.parse(fs.readFileSync(_epdata + '/settings.json', 'utf8'));
		o[k] = v;
		fs.writeFileSync(_epdata + '/settings.json', JSON.stringify(o, null, 2));
		return v;
	}
}

exports.toggleDeveloper = function() {
	if (wc.findFunc('isDeveloper')[1].exports.isDeveloper) { wc.findFunc('isDeveloper')[1].exports.__defineGetter__('isDeveloper',()=>false); }
	else { wc.findFunc('isDeveloper')[1].exports.__defineGetter__('isDeveloper',()=>true); }
}

// Discord is a bunch of assholes so they removed the localStorage object
// This means we have to do stupid shit like manually search for and extract the token from the SQLite database
// If we had access to some sort of SQLite lib, we could do this in a much more elegant way, but this works so who cares
function token() {
	// this isn't needed anymore but it's so damn cool that it's staying
	//return fs.readFileSync(_epdata + "../Local Storage/https_discordapp.com_0.localstorage", 'utf8')
	//	.match(/M\0(?:(?!\.)[--z]\0){23}\.\0(?:(?!\.)[--z]\0){6}\.\0(?:(?!\.)[--z]\0){27}|m\0f\0a\0\.\0(?:(?!\.)[--z]\0){84}/)[0]
	//	.replaceAll('\0', '');
	return wc.findCache('ObjectStorage')[0].exports.impl.get('token');
}

// REST
exports.discord = {
	rest: function (m, e, p, c) {
		if (typeof (c) == "undefined") {
			c = function () { };
		}
		var xhr = new XMLHttpRequest();
		var url = "https://discordapp.com/api/v6" + e;
		xhr.open(m, url, true);
		xhr.setRequestHeader("Authorization", token());
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status.toString().startsWith('4')) {
					throw (xhr.responseText);
				}
				if (xhr.status.toString().startsWith('5')) {
					throw (xhr.responseText);
				}
				c(xhr.responseText);
			}
		};
		var data = p;
		xhr.send(data);
	},

	sendMessage: function (channel, text) {
		this.rest('POST', `/channels/${channel}/messages`, JSON.stringify({ content: text }));
	},

	sendEmbed: function (channel, ebd) {
		this.rest('POST', `/channels/${channel}/messages`, JSON.stringify(
			{
				embed: ebd
			}
		));
	},

	getGuild: function (id, c) {
		this.rest('GET', `/guilds/${id}`, '', function (e) { c(JSON.parse(e)) })
	},

	getChannel: function (id, c) {
		this.rest('GET', '/channels/' + id, '', function (e) { c(JSON.parse(e)) })
	},

	getUser: function (id, c) {
		this.rest('GET', '/users/' + id, '', function (e) { c(JSON.parse(e)) })
	},

	getGuildRoles: function (id, c) {
		this.rest('GET', `/guilds/${id}/roles`, '', function (e) { c(JSON.parse(e)) })
	},

	getGuildChannels: function (id, c) {
		this.rest('GET', `/guilds/${id}/channels`, '', function (e) { c(JSON.parse(e)) })
	},

	getGuildUser: function (id, uid, c) {
		this.rest('GET', `/guilds/${id}/members/${uid}`, '', function (e) { c(JSON.parse(e)) })
	},

	getGuildUsers: function (id, c) {
		this.rest('GET', `/guilds/${id}/members?limit=1000`, '', function (e) { c(JSON.parse(e)) })
	}
}

window.$api = exports;
