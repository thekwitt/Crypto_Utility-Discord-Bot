const { MessageAttachment, MessageEmbed } = require('discord.js');
const resizeImg = require('resize-image-buffer');
const sizeOf = require('buffer-image-size');


function SortFinder(client, assets, strings) {

	for(let k = 0; k < strings.length; k++) {
		if(strings[k] != undefined && strings[k].toLowerCase() == 'random') {
			assets = client.extra.shuffle(assets);
			break;
		}
		else if (strings[k] != undefined && strings[k].toLowerCase() == 'realm') {
			const tempArray = [];
			const realms = ['Terra', 'Sea', 'Forest', 'Fire', 'Spirit', 'Mecha', 'Cyber', 'Banished', 'Divine'];

			for(let i = 0; i < realms.length; i++) {
				for(let j = 0; j < assets.length; j++) {
					const f = assets[j].traits[assets[j].traits.map(e => e.trait_type).indexOf('Realm')].value;
					if (f == realms[i]) {
						tempArray.push(assets[j]);
					}
				}
			}
			assets = tempArray;
			break;

		} else if(strings[k] != undefined && ['terra', 'sea', 'forest', 'fire', 'spirit', 'mecha', 'cyber', 'banished', 'divine'].includes(strings[k].toLowerCase())) {
			const tempArray = [];

			for(let j = 0; j < assets.length; j++) {
				const f = assets[j].traits[assets[j].traits.map(e => e.trait_type).indexOf('Realm')].value;
				if (f.toLowerCase() == strings[k].toLowerCase()) {
					tempArray.push(assets[j]);
				}
			}
			assets = tempArray;
			break;
		}
	}

	return assets;
}

function ExcludeFinder(strings) {
	for(let i = 0; i < strings.length; i++) {
		if(strings[i].toLowerCase() == 'excludeid') return true;
	}
	return false;
}

function ColumnFinder(strings) {
	for(let i = 0; i < strings.length; i++) {
		if(strings[i] != undefined && isNaN(strings[i]) == false) {
			if(Number(strings[i]) <= 30 && Number(strings[i]) >= 2) return Number(strings[i]);
		}
	}
	return 5;
}

module.exports = {
	name: 'collageaeon',
	guide: '**!collageaeon [Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\nor\n**!collagea [[Eth Addresses (Seperate Each Address by Comma if Multiple)] [Options]**\n\n**__Options__**\n**Sort Method:** Random or Realm\n**Columns:** 2-30\n**Filter Method:** Any Realm Trait\n**Without IDs:** ExcludeID\n\nExample: **!collageaeon 0xD4091d661A44648D61bd3bb51E129d0d60892056 realm excludeid 10**\nor\nExample: **!collagea 0xD4091d661A44648D61bd3bb51E129d0d60892056 forest 25**',
	alias: ['collagea'],
	async execute(message, client, collage) {
		const strings = message.content.toLowerCase().split(' ');
		if(strings[1] == undefined) {
			try{return await collage.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your skullx is being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 15 seconds.');

		try{collage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		let assets = await client.extra.callAllWallets(await client.extra.ens2eth(client, strings[1]), '0xd4f417cfd29ae83a303b6d75f88b62a696de47e1');

		assets = SortFinder(client, assets, strings.slice(2));

		let columns = 5;

		columns = ColumnFinder(strings.slice(2));

		let attachment = undefined;

		if (assets.length == 0) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nOpensea rejected the summon!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await collage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		let buffer = undefined;

		if(assets != undefined || assets.length != 0) {

			try{
				embed = new MessageEmbed()
					.setTitle('🟠   Collagification Commencing   🟠')
					.setDescription('⠀\nAssets processed! Please wait ' + Math.ceil(assets.length / 7) + ' seconds for collagification.\n⠀')
					.setColor(client.colors[1])
					.setFooter('Hype!');

				try{await collage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
				catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			}
			catch{
				embed = new MessageEmbed()
					.setTitle('🔴   Summon Canceled!   🔴')
					.setDescription('⠀\nOpensea rejected the summon!\n⠀')
					.setColor(client.colors[0])
					.setFooter('Feel free to try again!');

				try{await collage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
				catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
				return;
			}

			buffer = await client.extra.makeCollage(assets, columns, ExcludeFinder(strings.slice(2)));
			attachment = new MessageAttachment(buffer, 'canvas.png');
		} else if (assets.length == 0) {
			return;
		}

		try{
			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3])
				.setImage('attachment://' + attachment.name);

			try{return await collage.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
		}
		catch {
			try {
				const dimensions = sizeOf(buffer);
				const image = await resizeImg(buffer, { width: dimensions.width / 2, height: dimensions.height / 2 });
				attachment = new MessageAttachment(image, message.author.username + '_collage.png');
				embed = new MessageEmbed()
					.setTitle('🟢   Summon Completed!   🟢')
					.setColor(client.colors[3])
					.setImage('attachment://' + attachment.name);

				try{return await collage.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
				catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
			} catch {
				client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');
			}
		}
	},
};