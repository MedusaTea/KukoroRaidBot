const { EnemyAliases } = require('./EnemyAliases.js');
const { Localized } = require('./translations.js');
const { botUsername } = require('./config.js');

exports.FindCommand = function(command) {
  let result;

  commands.forEach(function(c) {
    if (c.cmd === command) { result = c; }

    if (c.aliases) {
      c.aliases.forEach(function(a) {
        if (a === command) { result = c; };
      });
    }
  });

  return result;
};

const commands = [
    {
      cmd: '!players',
      desc: 'List players (requires !getinfo to be called on them)',
      aliases: ['!jugadores'],
      access: 'all',
      player: true,
      action: function(say, args,  players, lang) {
        if (!players.size) {
          say(Localized[lang][`No players listed`]);
          return;
        }
        const removeList = Array.from(players.values()).filter(function(p) {
          return !p.enemies;
        });
        removeList.forEach(function(rm){
          players.delete(rm.name);
        });

        const sorted = Array.from(players.values()).sort(function(a,b) {
          return a.pos && b.pos ? (a.pos > b.pos ? 1 : -1) : 1;
        });
        say(Localized[lang]['Count'] + `: ${players.size}`);
        sorted.forEach(function(p) {
          say(`${p.pos ? '#' + p.pos + ' ' : '' }${p.name} ${Localized[lang]['Lv.']} ${p.level}: ${p.enemies}`);
        });
      },
    },
    {
    cmd: '!who',
    aliases: ['!whocanfight', '!whocankill', '!quien'],
    desc: 'List of players with positive perks to enemy',
    access: 'all',
    player: true,
    action: function(say, args,  players, lang) {
      if (args.length < 2) { say('Invalid parameter'); return; }

      const name = args[1].toLowerCase();
      const en = EnemyAliases.get(name) || name;
      let found = false;
      const ps = [];
      players.forEach(function (k,v) {
        if (!k.enemies) {
          return;
        }
        if (k.enemies.includes(en)) {
          found = true;
          ps.push(k);
        }
      });

      const sorted = ps.sort(function(a,b){
        return a.pos && b.pos ? (a.pos > b.pos ? 1 : -1) : 1;
      });

      if (!found) {
        say(Localized[lang]['None found']);
      } else {
        sorted.forEach(function(k) {
          if (k.pos) {
            say(`#${k.pos} ${k.msg}`);
          } else {
            say(k.msg);
          }
        });
      }
    },
  },
  {
    cmd: '!search',
    desc: 'Search',
    aliases: ['!buscar'],
    access: 'all',
    player: true,
    action: function(say, args,  players, lang) {
      if (args.length < 2) { say(Localized[lang]['Invalid parameter']); return; }
      let count = 0;
      let query = '';
      for (let i=1; i < args.length; i++) {
        query += args[i] + ' ';
      }
      query = query.toLowerCase().trim();

      const ps = [];
      players.forEach(function(p) {
        if (p.msg.toLowerCase().includes(query)) {
        count++;
        ps.push(p);
        }
      });

      const sorted = ps.sort(function(a,b){
        return a.pos && b.pos ? (a.pos > b.pos ? 1 : -1) : 1;
      });

      if (!count) {
        say(Localized[lang]['No Results']);
      } else {
        sorted.forEach(function(p) {
          if (p.pos) {
            say(`#${p.pos} ${p.msg}`);
          } else {
            say(p.msg);
          }
        });
      }
    },
  },
  {
    cmd: '!turnon',
    desc: 'Turn bot on',
    access: 'mod',
    action: function(say, args, isMod, AutoJoin) {
    },
  },
  {
    cmd: '!turnoff',
    desc: 'Turn bot off',
    access: 'mod',
    action: function(say, args, isMod, AutoJoin) {
    },
  },
  {
    cmd: '!modonly',
    desc: 'Toggle if mod only',
    access: 'admin',
    action: function(say, args, isMod, AutoJoin) {
    },
  },
  {
    cmd: '!autojoin',
    desc: `Toggle if botUsername joins and calls !getinfo automatically`,
    access: 'mod',
    action: function(say, args, isMod, AutoJoin) {
    },
  },
  {
    cmd: '!kukoro',
    desc: `Will reset player list and join botUsername if autojoin is on`,
    access: 'admin',
    action: function(say, args, isMod, AutoJoin) {
      if (!AutoJoin) {
        return;
      }
      say('!kukoro');
      setTimeout(function() {
        say(`!getinfo`);
      }, 5000);
    },
  },
  {
    cmd: '!allinfo',
    desc: 'List of players relevant to enemy',
    access: 'all',
    player: true,
    action: function(say, args, players) {
      players.forEach(function(p) {
        say(p.msg);
      });
    },
  },
  {
    cmd: '!kill',
    desc: 'Remove player from players list',
    aliases: ['!matar'],
    access: 'all',
    action: function(say, args, isMod) {
    },
  },
  // info
  {
    cmd: '!commands',
    desc: 'List Commands',
    access: 'all',
    action: function(say, args, isMod, lang) {
      let cmdString = '';

      commands.forEach(function(c, i) {
        if (c.omit) { return; }

        if (c.access === 'all') {
          cmdString += ` ${c.cmd}`;
        }
      });

      say(cmdString);
      cmdString = '';
      if (isMod) {
        say(Localized[lang]['Mod Commands:']);
        commands.forEach(function(c, i) {
          if (c.access == 'mod') {
            cmdString += ` ${c.cmd}`
          }
        });
        say(cmdString);
      }

      cmdString = '';
      if (isMod) {
        say(Localized[lang]['Admin Commands:']);
        commands.forEach(function(c, i) {
          if (c.access == 'admin') {
            cmdString += ` ${c.cmd}`
          }
        });
        say(cmdString);
      }
    },
  },
  {
    cmd: '!help',
    desc: 'Get Info on Command',
    access: 'all',
    action: function(say, args, isMod, lang) {
      if (args.length < 2) {
        say(Localized[lang][`Get Info on Command`]);
        return;
      }
      const arg = args[1].replace('!', '');
      const p = commands.find(function(c) { return c.cmd === `!${arg}`;});
      if (!p) {
        say(Localized[lang][`Invalid Parameter`]);
        return;
      }

      say(`${p.cmd}: ${p.desc}`);
    },
  },
];

exports.Commands = commands;
