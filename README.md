## Preface
Not sure if this was ever finished and tested after separating from full TwitchPlaysKukoro codebase.

I had wanted to get the code public though, even if it's not fully working in this state.
It might be though!

Either way, it's a nice quick reference for setting up a twitch chat bot client setup.

## File Guide
bot.js contains the setup for hooking a bot up to listen and send messages via twitch's tmi package

commandList.js contains commands to intercept from chat, structured with an action to take, permission access level and command description

## English
Create a file called `.config.js` in the root directory and reference `.config-example.js` to add your twitch username and oauth token
## Espanol
Cree un archivo llamado `.config.js` en el directorio raíz y haga referencia a `.config-example.js` para agregar su nombre de usuario de twitch y token de autenticación

## Install
$ `npm install`

## Run
$ `node bot.js`
