const { MessageAttachment, MessageEmbed } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { buffer } = require('node:stream/consumers');
const GIFEncoder = require('gifencoder');

module.exports = {
	name: 'preview',
	alias: [],
	guide: '!preview [Collection (From URL)] [Delay Per Frame (MS) (Required)] [Token ID (Up to Ten, Separate by Commas)]',
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');
		if(strings[3] == undefined) {
			try{return await m.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your skullx is being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 2 - 10 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}


		let delay = Number(strings[2]);
		const collection = strings[1];
		const ids = strings[3].split(',');

		const new_ids = Array.from(ids.map(id => 'token_ids=' + id));

		const assets = [];

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?' + new_ids.join('&') + '&collection=' + collection);

		if(delay < 500) delay = 500;

		for(let i = 0; i < ids.length; i++) {
			const a = data.assets.filter(x => x.token_id == ids[i])[0];
			assets.push(await loadImage(a.image_url));
		}

		const canvas = createCanvas(assets[0].width, assets[0].height);
		const context = canvas.getContext('2d');
		const encoder = new GIFEncoder(assets[0].width, assets[0].height);
		encoder.setDelay(delay);
		encoder.setRepeat(0);
		encoder.setQuality(10);
		const stream = encoder.createReadStream();
		// stream the results as they are available into myanimated.gif
		encoder.start();

		for(const asset of assets) {
			context.drawImage(asset, 0, 0, asset.width, asset.height);
			encoder.addFrame(context);
		}

		encoder.finish();

		const b = await buffer(stream);

		const attachment = new MessageAttachment(b, 'preview.gif');

		embed = new MessageEmbed()
			.setTitle('🟢   Summon Completed!   🟢')
			.setColor(client.colors[3])
			.setImage('attachment://' + attachment.name);

		try{return await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
		return;

	},
};