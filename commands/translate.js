const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const { translate } = require('bing-translate-api');

const strings = require('../res/strings');
const colors = require('../res/colors');
const settings = require('../settings.js');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const { warnUser } = require('../functions/warnUser.js');

function truncate(string, length) {
	if (string.length <= length) return string
  else return string.substr(0, length - 1) + '\u2026'
}

module.exports = {
	name: 'translate',
	description: 'Translates messages (duh)',
	guildOnly: false,
	uses: 'Bot Developers',
	syntax: `${prefix}translate`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			const result = await translate(args.slice(1).join(' '), null, args[0]);
			
			args.shift()
			const embed = new Discord.MessageEmbed()
				.setAuthor(truncate(args.join(' '), 65), message.author.displayAvatarURL())
				.setDescription(`\`\`\`${result.translation}\`\`\``)
				.setColor(colors.BLUE)
				.setFooter(`${result.language.from} → ${result.language.to}`, settings.BOT_IMG);
				
			const embedMessage = await message.channel.send(embed);

			if (result.translation.includes('sus')) {
				if (message.guild.id == settings.C32_ID) await embedMessage.react('814877213857546270');
				if (message.guild.id == '720677267424018526') await embedMessage.react('821052515989979206');
			}
		}
    else warnUser(message, 'This command is currently disabled for testing!');
	}
};