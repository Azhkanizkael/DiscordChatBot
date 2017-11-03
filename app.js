//Initialization
const tmi = require("tmi.js");
const config = require("./config")
const fs = require("fs");
const Enmap = require("enmap")
const EnmapLevel = require("enmap-level")
const Discord = require("discord.js");
const bot = new Discord.Client();

//Settings Database
const settings = new Enmap({ provider: new EnmapLevel({ name: 'settings' }) });
bot.on("guildCreate", guild => {
    settings.set(guild.id, guild.id);
});
bot.on("guildDelete", guild => {
    settings.delete(guild.id);
});
bot.on("guildMemberAdd", member => {
    const guildConf = settings.get(member.guild.id);
});
//Bot Commands
bot.on('ready', () => {
    console.log('Battlecruiser Operational!');
    console.log('Prefix set to: ' + config.discord.prefix);
    bot.guilds.forEach(guild => {
        console.log("loading guild id: " + guild.id)
        try{
            var dchan = settings.get(guild.id).discord
            var tchan = settings.get(guild.id).twitch
            console.log('using: ' + tchan + ' ' + dchan)
            ConnectionStart(tchan,dchan)
        } catch (err) {
            var dchan
            var tchan
        }
    });
  });
bot.on('message', async (message) => {
    if (!message.guild || message.author.bot) return;
    if (message.content.indexOf(config.discord.prefix) !== 0) return;
    const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch(command) {
        case "channels" :
            settings.set(message.guild.id,{twitch: args[0],discord: args[1]});
            var tchan = settings.get(message.guild.id).twitch
            var dchan = settings.get(message.guild.id).discord
            console.log('set: ' + tchan + ' ' + dchan)
            break;
        case "start" :
            ConnectionStart(tchan,dchan);
            break;
        case "stop" :
            break;
    }
});
bot.login(config.discord.token);

function ConnectionStart(tchan,dchan) {
    console.log('connecting: ' + tchan + ' ' + dchan)
    client = new tmi.client({
        identity: {
            username: config.twitch.account,
            password: config.twitch.token
        },
        channels: ["#" + tchan]
    });
    client.connect();
    client.on("message", function (channel, userstate, message, self) {
        if (self)
            return;
        switch (userstate["message-type"]) {
            case "action":
                var MessageToDiscord = "**<" + userstate.username + ">** " + message;
                console.log(tchan + " - " + MessageToDiscord);
                bot.channels.get(dchan).send(MessageToDiscord);
                break;
            case "chat":
                var MessageToDiscord = "**<" + userstate.username + ">:** " + message;
                console.log(tchan + " - " + MessageToDiscord);
                bot.channels.get(dchan).send(MessageToDiscord);
                break;
            case "whisper":
                break;
            default:
                break;
        }
    });
}
//# sourceMappingURL=app.js.map