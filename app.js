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
        console.log("loading guild id: " + guild.name);
        guild.channels.forEach(channel =>{
            try{
                var dchan = settings.get(guild.id+'-'+channel.id).discord;
                var tchan = settings.get(guild.id+'-'+channel.id).twitch;
                ConnectionStart(tchan,dchan,guild.id+'-'+channel.id);
                console.log('using: ' + tchan + ' on #' + channel.name);
            } catch (err) {
                var dchan
                var tchan
            }
        })
    });
  });
bot.on('message', async (message) => {
    if (!message.guild || message.author.bot) return;
    if (message.content.indexOf(config.discord.prefix) !== 0) return;
    if (message.author.id !== message.guild.ownerID) return;
    const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch(command) {
        case "channel" :
            settings.set(message.guild.id+'-'+message.channel.id,{twitch: args[0],discord: message.channel.id, client: null});
            var tchan = settings.get(message.guild.id+'-'+message.channel.id).twitch;
            var dchan = settings.get(message.guild.id+'-'+message.channel.id).discord;
            console.log('set: ' + tchan + ' ' + dchan);
            message.reply('#' + bot.channels.get(dchan).name + ' is now connected to twitch.tv/' + tchan + '.');
            break;
        case "clear" :
            settings.get(message.guild.id+'-'+message.channel.id).client.disconnect();
            settings.delete(message.guild.id+'-'+message.channel.id);
            console.log('deleting settings for: ' + message.guild.id+'-'+message.channel.id);
            message.reply("settings cleared.");
        case "start" :
            try{
                var tchan = settings.get(message.guild.id+'-'+message.channel.id).twitch;
                var dchan = settings.get(message.guild.id+'-'+message.channel.id).discord;
                try{
                    settings.get(message.guild.id+'-'+message.channel.id).client.disconnect();
                } catch (err) {
                    console.log('There is no currently running twitch client for ' + message.guild.id + '.')
                }
                ConnectionStart(tchan,dchan,message.guild.id+'-'+message.channel.id);
                console.log(message.guild.id+'-'+message.channel.id + ' connected');
                message.reply("Twitch Chat for twitch.tv/" + tchan + ' is now connected')
                break;
            } catch (err) {
            }
        case "stop" :
            try{
                var tchan = settings.get(message.guild.id+'-'+message.channel.id).twitch
                var dchan = settings.get(message.guild.id+'-'+message.channel.id).discord
                settings.get(message.guild.id+'-'+message.channel.id).client.disconnect();
                console.log(message.guild.id+'-'+message.channel.id + ' disconnected');
                message.reply("Twitch Chat for twitch.tv/" + tchan + ' is now disconnected')
            } catch (err) {
            }
            break;
    }
});
bot.login(config.discord.token);

function ConnectionStart(tchan,dchan,gid) {
    var client = new tmi.client({
        identity: {
            username: config.twitch.account,
            password: config.twitch.token
        },
        channels: ["#" + tchan]
    });
    client.connect();
    settings.set(gid,{twitch: tchan,discord: dchan, client: client});
    console.log('connecting: ' + tchan + ' ' + dchan)
    client.on("message", function (channel, userstate, message, self) {
        if (self)
            return;
        switch (userstate["message-type"]) {
            case "action":
                var MessageToDiscord = "**" + userstate.username + "** " + message;
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