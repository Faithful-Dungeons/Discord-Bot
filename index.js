const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () =>{
	console.log("I am turned on lmao");
});

client.on('message', async message => {
	if (message.channel.id === "715236892945285181") {
		if (message.attachments.size > 0) {
			if(!message.content.includes("(")) {
				message.reply("your texture submission doesn't contain a file path! Please specify the file path like this: `*texture name* (Content/*path*/*path*/*path*/*texture name*)`")
					.then(msg => {
						msg.delete({ timeout: 30000 })
					})
			}
    	    else try {
    	    	await message.react('✅');
    	    	await message.react('❌');
    	    } catch (error) {
    	    	console.error("ERROR | One of the emojis failed to react!");
    	    }
		}
//		else if(!message.sender === "720680190640128010") {
//			message.reply("this channel is only for textures. If you want to talk about about a submitted texture, then go to #texture-discussion")
//				.then(msg => {
//					msg.delete({ timeout: 30000 })
//				})
//	    }
	}
});

client.on("message", message => {
	if (message.channel.id === "720677267977535592") {
		if(!message.content.startsWith("@Faithful Dungeons#0623 behave")) {
			message.reply("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)")
		}
	}
});

client.login('NzIwNjgwMTkwNjQwMTI4MDEw.XuJfuw.n5WGlscZCeLAcQkYVuI4gAFILlQ');
