const { MessageAttachment, MessageEmbed } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

let juice = 20;
let nutensity = 18;

async function recover() {
	if(juice < 20) juice++;
	if(nutensity < 18) nutensity++;
}

function PartyNut(client) {
	const fs = require('fs');
	const files = fs.readdirSync('./nuts/');
	return './nuts/' + client.extra.getRandom(files);
}

setInterval(async function() {recover();}, 600000);

module.exports = {
	name: 'partynut',
	alias: [],
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');
		const attachments = Array.from(message.attachments.values());


		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your nut is being summoned\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}


		if(juice > 0) juice--;
		if(nutensity > 8) nutensity--;

		if(attachments.length != 0) {
			const a = [];

			for(let x = 0; x < attachments.length; x++) {
				const attachment = attachments[x];

				if(attachment.url != undefined) {

					const avatar = await loadImage(attachment.url);

					const percent = 128 / avatar.height;

					const canvas = createCanvas(avatar.width * percent, 128);
					const context = canvas.getContext('2d');

					context.drawImage(avatar, 0, 0, avatar.width * percent, 128);
					for(let i = 0; i < client.extra.random(juice, juice + 5); i++) {
						const nut = await loadImage(PartyNut(client));
						const size = client.extra.random(4, nutensity);
						context.drawImage(nut, client.extra.random(0, 116), client.extra.random(0, 116), size * 3, size * 3);
					}

					a.push(new MessageAttachment(canvas.toBuffer(), message.author.username + '_' + Date.now().toString() + '.png'));
				}
			}

			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3])
				.setImage(a[0]);

			try{return await m.edit({ embeds: [embed], files: a }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}

		} else if(strings[1] == 'skullx') {

			const id = Number(strings[2]);

			if(id > 10000 || id < 1) return;

			const reform = 10000 - id;

			const assets = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?order_direction=desc&offset=' + reform + '&limit=1&asset_contract_address=0x1dc5d3b2162f9500d7ddec14eb0ba9ccb43bc20c');

			const asset = assets.assets[0];

			if(asset != undefined) {

				const avatar = await loadImage(asset.image_url);

				const percent = 128 / avatar.height;

				const canvas = createCanvas(avatar.width * percent, 128);
				const context = canvas.getContext('2d');

				context.drawImage(avatar, 0, 0, avatar.width * percent, 128);
				for(let i = 0; i < client.extra.random(juice, juice + 5); i++) {
					const nut = await loadImage(PartyNut(client));
					const size = client.extra.random(4, nutensity);
					context.drawImage(nut, client.extra.random(0, 116), client.extra.random(0, 116), size * 3, size * 3);
				}

				const a = new MessageAttachment(canvas.toBuffer(), message.author.username + '_' + Date.now().toString() + '.png');

				embed = new MessageEmbed()
					.setTitle('🟢   Summon Completed!   🟢')
					.setColor(client.colors[3])
					.setImage('attachment://' + a.name);

				try{return await m.edit({ embeds: [embed], files: [a] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
				catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
			}
		} else if(message.mentions.users.size != 0) {
			const users = Array.from(message.mentions.users.values());

			if (users == undefined) return;

			for(let x = 0; x < users.length; x++) {
				const user = users[x];

				if(user.avatar != undefined) {

					const canvas = createCanvas(128, 128);
					const context = canvas.getContext('2d');
					const avatar = await loadImage(user.avatarURL({ format: 'png' }));

					context.drawImage(avatar, 0, 0);
					for(let i = 0; i < client.extra.random(juice, juice + 5); i++) {
						const nut = await loadImage(PartyNut(client));
						const size = client.extra.random(4, nutensity);
						context.drawImage(nut, client.extra.random(0, 116), client.extra.random(0, 116), size * 3, size * 3);
					}

					attachments.push(new MessageAttachment(canvas.toBuffer(), message.author.username + '_' + Date.now().toString() + '.png'));
				}
			}
			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3]);

			for(let i = 0; i < attachments.length; i++) {
				embed.setImage('attachment://' + attachments[i].name);
			}

			try{return await m.edit({ embeds: [embed], files: attachments }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
		} else {
			const canvas = createCanvas(128, 128);
			const context = canvas.getContext('2d');
			const avatar = await loadImage(message.author.avatarURL({ format: 'png' }));

			context.drawImage(avatar, 0, 0);
			for(let i = 0; i < client.extra.random(juice, juice + 5); i++) {
				const nut = await loadImage(PartyNut(client));
				const size = client.extra.random(4, nutensity);
				context.drawImage(nut, client.extra.random(0, 116), client.extra.random(0, 116), size * 3, size * 3);
			}

			const attachment = new MessageAttachment(canvas.toBuffer(), message.author.username + '_' + Date.now().toString() + '.png');

			embed = new MessageEmbed()
				.setTitle('🟢   Summon Completed!   🟢')
				.setColor(client.colors[3])
				.setImage('attachment://' + attachment.name);

			try{return await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}
		}
	},
};