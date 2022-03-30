const { MessageAttachment, MessageEmbed } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const gifFrames = require('gif-frames');
const { buffer } = require('node:stream/consumers');
const GIFEncoder = require('gifencoder');


function returnSize(text, context) {
	let size = 60;
	context.font = size + 'px "meme"';
	let metrics = context.measureText(text);
	while (metrics.width > 440) {
		context.font = size + 'px "meme"';
		metrics = context.measureText(text);
		size -= 1;
	}

	return size;
}

module.exports = {
	name: 'meme',
	alias: [],
	guide: '!meme [Collection Name] [Token ID] [Color (use _ for spaces)] (Top Message [For two lines separate by comma]) (Bottom Message[For two lines separate by comma])\n\nExample: !meme skullx 1 white (This is,an epic) (Poster Example)\n\nColors: https://gist.github.com/jjdelc/1868136',
	async execute(message, client, m) {

		if(message.content.toLowerCase() === '!meme') {
			try{return await m.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		const strings = message.content.toLowerCase().replace(/(\r\n|\n|\r)/gm, '').split(' ');
		const tempMatchAll = message.content.replace(/(\r\n|\n|\r)/gm, '').match(/\(([^)]+)\)/g);
		const matches = [];

		try{matches.push(tempMatchAll[0].substring(1, tempMatchAll[0].length - 1).split(','));}
		catch{;}

		try{matches.push(tempMatchAll[1].substring(1, tempMatchAll[1].length - 1).split(','));}
		catch{;}

		const color = client.crayola.filter(c => c.name.toLowerCase() === strings[3].toLowerCase().replace('_', ' '))[0];

		if(color == undefined) strings[3] = '#EDEDED';
		else strings[3] = color.hex;

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your skullx is being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 2 - 30 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		const collection = strings[1];
		const id = strings[2];

		let assets = [];

		try {
			assets = await client.extra.getBasicAssets(client, id, collection);
			assets = assets.assets;
		} catch {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nOpensea rejected the summon!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		const asset = await loadImage(assets[0].image_url);

		let results = undefined;
		try{ results = await gifFrames({ url: assets[0].image_url, frames: 'all', cumulative: true }); }
		catch {;}

		registerFont('./HitandRun-Regular.otf', { family: 'meme' });

		let attachment = undefined;

		if(results == undefined) {
			const w = 450;
			const ratio = asset.height / asset.width;
			const h = w * ratio;

			const canvas = createCanvas(w, h);
			const context = canvas.getContext('2d');

			context.drawImage(asset, 0, 0, w, h);

			context.fillStyle = '#000000';
			context.strokeStyle = 'black';
			context.lineWidth = 2;

			context.textAlign = 'center';
			context.fillStyle = strings[3];

			for(let i = 0; i < matches[0].length; i++) {

				const size = returnSize(matches[0][i], context);

				context.font = size + 'px "meme"';

				context.fillText(matches[0][i], 225, 60 + ((size + 10) * i));
				context.strokeText(matches[0][i], 225, 60 + ((size + 10) * i));
			}

			if(matches[1] != undefined) {
				matches[1] = matches[1].reverse();

				for(let i = 0; i < matches[1].length; i++) {

					const size = returnSize(matches[1][i], context);

					context.font = size + 'px "meme"';

					context.fillText(matches[1][i], 225, (h - 15) - ((size + 10) * i));
					context.strokeText(matches[1][i], 225, (h - 15) - ((size + 10) * i));
				}
			}

			const buffer = canvas.toBuffer();
			attachment = new MessageAttachment(buffer, 'canvas.png');
		} else {

			const images = [];

			for(let i = 0; i < results.length; i++) {
				images.push(results[i].getImage());
			}

			const w = 450;
			const ratio = asset.height / asset.width;
			const h = w * ratio;

			const canvas = createCanvas(w, h);
			const context = canvas.getContext('2d');

			context.fillStyle = '#000000';
			context.strokeStyle = 'black';
			context.lineWidth = 2;

			context.textAlign = 'center';
			context.fillStyle = strings[3];

			const encoder = new GIFEncoder(w, h);
			encoder.setDelay(100);
			encoder.setRepeat(0);
			encoder.setQuality(10);
			const stream = encoder.createReadStream();
			if(matches[1] != undefined) matches[1] = matches[1].reverse();

			encoder.start();

			for(const asset of images) {
				const fuck = await loadImage(asset._obj);
				context.drawImage(fuck, 0, 0, w, h);

				for(let i = 0; i < matches[0].length; i++) {

					const size = returnSize(matches[0][i], context);

					context.font = size + 'px "meme"';

					context.fillText(matches[0][i], 225, 60 + ((size + 10) * i));
					context.strokeText(matches[0][i], 225, 60 + ((size + 10) * i));
				}

				if(matches[1] != undefined) {
					for(let i = 0; i < matches[1].length; i++) {

						const size = returnSize(matches[1][i], context);

						context.font = size + 'px "meme"';

						context.fillText(matches[1][i], 225, (h - 15) - ((size + 10) * i));
						context.strokeText(matches[1][i], 225, (h - 15) - ((size + 10) * i));
					}
				}


				encoder.addFrame(context);
			}

			encoder.finish();
			const b = await buffer(stream);
			attachment = new MessageAttachment(b, 'preview.gif');
		}

		embed = new MessageEmbed()
			.setTitle('🟢   Summon Completed!   🟢')
			.setColor(client.colors[3])
			.setImage('attachment://' + attachment.name);


		try{return await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}

	},
};