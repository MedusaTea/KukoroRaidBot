// [KUKORO]
// don't ask me what i did in this file, i don't even know
// i think this was to parse out terms that were at the end of a sentence with like "]" connected
// there's some logic in there to reference when 'but' is said, to associate it as negative effect instead of buff, idunno

const { Localized } = require('./translations.js');

exports.KukoroPlayer = function(args, msg, lang) {
  if (args.length < 3) { return; }

  if (args[2] === '(' + Localized[lang]['Lv.']) {
    const msgSplit = msg.split(" ");
    const enemies = [];
    const boss = Localized[lang]['boss'];
    const any = Localized[lang]['any'];

    if (msg.toLowerCase().includes(boss)) {
        enemies.push(boss);
    }
    if (msg.toLowerCase().includes(any) && !msg.toLowerCase().includes(boss)) {
        enemies.push(any);
    }

    let skipping = false;
    msgSplit.forEach(function(m, i) {
      if (skipping) { return; }
      if (m.toLowerCase() === Localized[lang]['but']) {
        skipping = true;
        return;
      }

      m = m.toLowerCase().replace('[', '').replace(']', '');

      // this needs finese, 1 lang enemy first, another 2nd
      if (m === 'enemy') {
        enemies.push(msgSplit[i+1].replace(']', '').replace('.', '').replace('\'s', '').replace('[', ''));
      } else if (m === 'enemigo') {
        enemies.push(msgSplit[i-1].replace(']', '').replace('.', '').replace('\'s', '').replace('[', ''));
      }
    });

    // end result is this, looks like the above is mainly parsing enemy types from edge case strings
    return {
      name: args[1].toLowerCase(),
      enemies,
      msg: msg.replace('[KUKORO] ', ''),
      level: args[3].replace(',', ''),
    };
  }
}
