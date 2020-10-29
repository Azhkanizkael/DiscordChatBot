//Initialization
const config = require("./config")
const Discord = require("discord.js");
const bot = new Discord.Client();

//Settings Database

//Bot Commands
bot.login(config.discord.token);