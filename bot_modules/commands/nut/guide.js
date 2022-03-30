module.exports = {
	name: 'guide',
	alias: ['g'],
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');

		if(strings[1] == undefined) {
			try{return await m.edit({ embeds: [], content: '!guide collections - How collections work with this bot\n!guide index - Looking up Skullx Collections or Other NFTs\n!guide collage - Building SkullX Collages or Other NFT Collages\n!guide nut - Forbidden Commands\n!guide fun - Messing around with your NFTs just for fun!\n\nIf you want in-depth explainations, just do the command without any of the paramaters for a full guide of that command.\n\nCheers!' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		} else if(strings[1].toLowerCase() == 'nut') {
			try{return await m.edit({ embeds: [], content: 'To nut yourself: !nut\nTo nut others: !nut [User Tags (As many as you want)]\nTo nut pictures: !nut (attach files to nut them) OR !nut [Link]\nTo nut a skullx: !nut skullx [Skullx Token ID]\n\n**(All of this also applies to !partynut)**' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		} else if(strings[1].toLowerCase() == 'fun') {
			try{return await m.edit({ embeds: [], content: 'To Create Split Images of NFTs: !split [Collection] [Token ID #1] [Token ID #2] or !split [Token ID #1] [Token ID #2] [Token ID #3] [Token ID #4]\n!preview [Collection (From URL)] [Delay Per Frame (MS) (Required)] [Token ID (Up to Ten, Separate by Commas)]\nTo see who is driving up the gas: !whosminting' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		} else if (strings[1].toLowerCase() == 'index') {
			try{return await m.edit({ embeds: [], content: 'To Search A SkullX - !skullx [SkullX Token ID] or !s [SkullX Token ID]\n\nTo Search an Aeon - !aeon [Aeon Token ID] or !a [Aeon Token ID]\n\nTo Search A Random Skull - !rs\n\nTo Search Any NFT in any Project - !lookup [Contract or Slug/Collection Name] [Token ID] or !lu [Contract or Slug/Collection Name] [Token ID]' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		} else if (strings[1].toLowerCase() == 'collage') {
			try{return await m.edit({ embeds: [], content: 'Skullx Collages - **!collages [[Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\n\nAeon Collages - **!collagea [[Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\n\nPixel Collages - **!collagep [[Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\n\nSkullX Family Collage **!collagef [[Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\n\nAny NFT Collage - **!collage [Eth Addresses (Seperate Each Address by Comma if Multiple)] [Contract or Slug/Collection Name (Seperate Each Address by Comma if Multiple)] [Options]**\n\n\n**__Options__**\n**Sort Method:** Random or Realm\n**Columns:** 2-30\n**Filter Method:** Any Realm Trait\n**Without IDs:** ExcludeID' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		} else if (strings[1].toLowerCase() == 'collections') {
			try{return await m.edit({ embeds: [], content: 'There are two ways you can enter a collection in this bot for commands, using the contract address or by the slug or url name from OS.\n\nHowever, if your desired collection is from the OS contract, get the Token ID found in the details tab on that NFT\'s OS Page or get it straight from the URL (The last big number)\n\n**Polygon Contracts do not work at the moment. This feature is being researched and developed.**' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
			return;
		}	},
};