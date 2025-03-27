const tmi = require('tmi.js');
const { Commands, FindCommand, ResetBook } = require('./commandList.js');
const { KukoroPlayer } = require('./kukoroCommands.js');
const { Localized } = require('./translations.js');
const { botUsername, twitchChannel, oauthToken, language } = require('./config.js');

const opts = {
  identity: {
      username: botUsername,
      password: oauthToken,
  },
    channels: [
      twitchChannel,
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

const CommandList = [];
Commands.forEach(function(c) {
  CommandList.push(c.cmd);
});

let Channels = new Map();

opts.channels.forEach(c => {
  Channels.set(c.replace('#', ''), {
    Players: new Map(),
    Active: true,
    AutoJoin: false,
	ModOnly:  true,
  });
});

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
  if (typeof msg !== 'string') {
    return;
  }

  const channelName = target.replace('#', '');
  const channel = Channels.get(channelName);

  if (!channel) {
    console.log('channel not found: ', channelName);
    return;
  }

  const lang = language;

  function isAdmin() {
    return context.username == channelName;
  };

  function isMod() { return isAdmin() || context.mod; };
  function say(words) { client.say(target, words); };

  // Remove 7tv duplicate message character and get args
  const args = msg.replace('\u{E0000}', '').split(' ');
  let commandName = args[0].trim().toLowerCase().replace('!', ''); // Remove whitespace from chat message
  commandName = '!' + commandName;

  if (isAdmin() && args.length) {
    if (args[0] === 'modonly') {
      channel.ModOnly = !channel.ModOnly;
      if (channel.ModOnly) {
        say(Localized[lang]['Mod Only On']);
      } else {
        say(Localized[lang]['Mod Only Off']);
      }
    }

    if (args[0] === 'autojoin') {
      channel.AutoJoin = !channel.AutoJoin;
      if (channel.AutoJoin) {
        say(Localized[lang][`botUsername will join and getinfo`]);
      } else {
        channel.AutoJoin = false;
        say(Localized[lang][`botUsername will not join`]);
      }
    }
    if (args[0].replace('!', '') === Localized[lang]['turnon']) {
      channel.Active = true;
      say(Localized[lang]['Kukoro Raid bot turned on']);
    } else if (args[0].replace('!', '') === Localized[lang]['turnoff']) {
      channel.Active = false;
      say(Localized[lang]['Kukoro Raid bot turned off']);
    }
  }

  if (!channel.Active) {
    return;
  }

  const Players = channel.Players;

  if (args[0].toLowerCase() === '!kukoro' && args.length === 1 && context.username !== botUsername) {
    if (channel.AutoJoin) {
      setTimeout(function() {
        say(`!getinfo @${ context.username }`);
      }, 5000);
    }
  }

  if (args[0] === '[KUKORO]' && isAdmin()) {
    if (msg.includes(Localized[lang]['RAID IS OVER'])){
      channel.Players = new Map();

      if (msg.includes(Localized[lang]['leveled up for the next raid'])) {
        say('\\o/');
      } else {
        say('o7');
      }
    }

    const p = KukoroPlayer(args, msg, lang);
    if (p) {
      const savedP = Players.get(p.name.toLowerCase());
      if (savedP) {
        p.pos = savedP.pos;
      }

      Players.set(p.name.toLowerCase(), p);
    }
    return;
  };

if (!isMod() && channel.ModOnly && args[0].toLowerCase() !== '!kukoro') {
	return;
}
  if (commandName === '!kill') {
    if (args.length < 2) { return; }
    let n = args[1].replace('@', '').toLowerCase();
    if (!isNaN(n)) {
      Players.forEach(function (k,v) {
        if (k.pos == n) {
          n = k.name;
        }
      });
    }
    if (Players.delete(n)) {
      say(`o7 ${n} o7`);
    } else {
      say(Localized[lang][`Unknown Player`]);
    }
    return;
  }

  if (commandName === '!kukoro' && args.length === 1 && isAdmin()) {
      channel.Players = new Map();
  }

  const cmd = FindCommand(commandName);
  if (!cmd) { return; }

  if (cmd.player) {
    cmd.action(say, args, Players, lang);
    return;
  }

  if (cmd.access === 'all') {
    cmd.action(say, args, isMod(), lang);
    return;
  }

  if (cmd.access === 'mod') {
    if (!isMod()) {
      say(`Mod Command Only: ${cmd.cmd}`);
      return;
    }

    cmd.action(say, args, true, lang);
    return;
  }

  if (cmd.access === 'admin') {
    if (!isAdmin()) {
      return;
    }

    cmd.action(say, args, true, channel.AutoJoin, lang);

    return;
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
