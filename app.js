//Initialization
const config = require("./config")
const Discord = require("discord.js");
const bot = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

bot.login(config.discord.token);