const { MessageAttachment, MessageEmbed } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
	name: 'splitpfp',
	alias: ['split'],
	guide: '!split [Collection (From URL)] [Token ID #1] [Token ID #2] or !split [Collection (From URL)] [Token ID #1] [Token ID #2] [Token ID #3] [Token ID #4]',
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your skullx is being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		if(message.content.toLowerCase() === '!split' || message.content.toLowerCase() === '!splitpfp') {
			try{return await m.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		const collection = strings[1];
		const ids = Array.from(strings.slice(2).map(id => id));

		const new_ids = Array.from(ids.map(id => 'token_ids=' + id));

		const assets = [];

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?' + new_ids.join('&') + '&collection=' + collection);

		for(let i = 0; i < ids.length; i++) {
			const a = data.assets.filter(x => x.token_id == ids[i])[0];
			assets.push(await loadImage(a.image_url));
		}


		const canvas = createCanvas(assets[0].width, assets[0].height);
		const context = canvas.getContext('2d');

		if(assets.length == 2) {
			context.drawImage(assets[0], 0, 0, assets[0].width / 2, assets[0].height, 0, 0, assets[0].width / 2, assets[0].height);
			context.drawImage(assets[1], assets[1].width / 2, 0, assets[1].width / 2, assets[1].height, assets[1].width / 2, 0, assets[1].width / 2, assets[1].height);

			const buffer = canvas.toBuffer();
			const attachment = new MessageAttachment(buffer, 'canvas.png');

			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3])
				.setImage('attachment://' + attachment.name);

			try{return await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
			return;
		} else if (assets.length == 4) {
			context.drawImage(assets[0], 0, 0, assets[0].width / 2, assets[0].height / 2, 0, 0, assets[0].width / 2, assets[0].height / 2);

			context.drawImage(assets[1], assets[1].width / 2, 0, assets[1].width / 2, assets[1].height / 2, assets[1].width / 2, 0, assets[1].width / 2, assets[1].height / 2);

			context.drawImage(assets[2], 0, assets[2].height / 2, assets[2].width / 2, assets[2].height / 2, 0, assets[2].height / 2, assets[2].width / 2, assets[2].height / 2);

			context.drawImage(assets[3], assets[3].width / 2, assets[2].height / 2, assets[3].width / 2, assets[1].height / 2, assets[3].width / 2, assets[3].height / 2, assets[3].width / 2, assets[3].height / 2);

			const buffer = canvas.toBuffer();
			const attachment = new MessageAttachment(buffer, 'canvas.png');

			try{return await message.channel.send({ files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}
	},
};