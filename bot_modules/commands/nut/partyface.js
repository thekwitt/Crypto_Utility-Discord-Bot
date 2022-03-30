const { MessageAttachment, MessageEmbed } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

function drawImageScaleRotate(img, ctx, x, y, scale, rotate) {
	const xAX = Math.cos(rotate) * scale;
	const xAY = Math.sin(rotate) * scale;
	ctx.setTransform(xAX, xAY, -xAY, xAX, x, y);
	ctx.drawImage(img, -img.width / 2, -img.height / 2);
}

function PartyHat(client) {
	const fs = require('fs');
	const files = fs.readdirSync('./partyface/');
	return './partyface/' + client.extra.getRandom(files);
}

module.exports = {
	name: 'partyface',
	alias: [],
	async execute(message, client, m) {

		const horn = await loadImage('./horn.png');

		const strings = message.content.toLowerCase().split(' ');

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your nut is being summoned\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		const id = Number(strings[1]);

		if(id > 10000 || id < 1) return;

		const reform = 10000 - id;

		const assets = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?order_direction=desc&offset=' + reform + '&limit=1&asset_contract_address=0x1dc5d3b2162f9500d7ddec14eb0ba9ccb43bc20c');

		const asset = assets.assets[0];

		if(asset != undefined) {

			const avatar = await loadImage(asset.image_url);

			const percent = 300 / avatar.height;

			const canvas = createCanvas(avatar.width * percent, 300);
			const context = canvas.getContext('2d');

			context.drawImage(avatar, 0, 0, avatar.width * percent, 300);

			drawImageScaleRotate(horn, context, 70, 185, 0.25, client.extra.random(-10, 10) * 0.03);

			const hat = await loadImage(PartyHat(client));

			context.drawImage(hat, -20, -880, hat.width * 0.5, hat.height * 0.5);

			//context.drawImage(horn, 10, 125, 120, 120);

			const a = new MessageAttachment(canvas.toBuffer(), message.author.username + '_' + Date.now().toString() + '.png');

			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3])
				.setImage('attachment://' + a.name);

			try{return await m.edit({ embeds: [embed], files: [a] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
		}
	},
};