const { MessageEmbed, MessageAttachment } = require('discord.js');
const { registerFont, createCanvas, loadImage } = require('canvas');


const guide = '!gs [Collection,Token ID,Token ID,Token ID, ETC...] (You can use up to 5 collections, 50 NFTs total.) \n\n Example: !gs skullx,1,2,3,4,5 kinkyskullx,1,2,3,4';

async function getNFTs(client, collections) {
	const assets = [];

	for(const collection of collections) {
		const temps = collection.toLowerCase().split(',');

		const c = temps[0];
		const n = temps.slice(1);

		n.forEach(function(part, index, theArray) { theArray[index] = 'token_ids=' + part; });

		const string = n.join('&');

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?include_orders=true&order_direction=desc&' + string + '&limit=50&collection=' + c);

		const collected = data.assets;

		assets.push(collected);
	}
	return assets;
}

function maxY(col_imgs) {
	let yMax = 0;

	for(let j = 0; j < col_imgs.length; j++) {
		const ys = new Array(5).fill(0);
		const imgs = col_imgs[j];
		for(let i = 0; i < imgs.length; i++) {
			const ind = i % 5;

			const ratio = imgs[i].height / imgs[i].width;
			const h = 250 * ratio;

			ys[ind] += h;
		}

		yMax += Math.max(...ys);
	}

	return yMax;
}

async function loadImages(assets) {
	const list = [];

	for(let i = 0; i < assets.length; i++) {
		list.push(await loadImage(assets[i].image_url));
	}

	return list;
}

function getCount(collections) {
	let x = 0;

	collections.forEach(c => x += c.length);

	return x;
}

function getID(asset) {
	let id = asset.token_id;
	try {
		if(Number(asset.token_id) > 100000) {
			const temp = asset.name.split('#');
			id = temp[temp.length - 1];
		}
	} catch {return id;}
	return id;
}

async function makeCollageColumnPrices(collections, prices) {
	let columns = 5;
	const col_imgs = [];

	for(const collection of collections) {
		col_imgs.push(await loadImages(collection));
	}

	const y = maxY(col_imgs, columns);

	const w = 250;

	const xCheck = getCount(collections);

	if(xCheck < columns) {
		columns = xCheck;
	}

	const x = w * columns;

	let ys = new Array(columns).fill(0);

	const canvas = createCanvas(x, y);
	const context = canvas.getContext('2d');

	registerFont('./Rank.ttf', { family: 'ranks' });

	for(let j = 0; j < col_imgs.length; j++) {
		const imgs = col_imgs[j];
		for(let i = 0; i < imgs.length; i++) {
			const ratio = imgs[i].height / imgs[i].width;
			const h = w * ratio;

			const ind = i % 5;

			context.drawImage(imgs[i], (ind) * w, ys[ind], w, h);

			ys[ind] += h;

			const id = getID(collections[j][i]);
			if(id != undefined) {
				// IDs
				context.fillStyle = '#000000';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 40), (ys[ind] - h) + Math.floor(h / 11));
				context.fillStyle = '#EDEDED';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 55), (ys[ind] - h) + Math.floor(h / 12));
				// Prices
				context.fillStyle = '#000000';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText(prices[j][i], (ind) * w + Math.floor(h / 35), (ys[ind] - Math.floor(h / 55)));
				context.fillStyle = '#EDEDED';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText(prices[j][i], (ind) * w + Math.floor(h / 50), (ys[ind] - Math.floor(h / 40)));
			}
		}

		ys = new Array(x).fill(Math.max(...ys));
	}

	return canvas.toBuffer();
}


module.exports = {
	name: 'garagesale',
	alias: ['gs'],
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');
		if(strings[1] == undefined) {
			try{return await m.edit({ content: guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
		}

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! We are building you a stand for your garagesale! The NFTs are being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		const collections = await getNFTs(client, strings.slice(1));

		embed = new MessageEmbed()
			.setTitle('🟠   Garagification Commencing   🟠')
			.setDescription('⠀\nAssets processed! We are now processing the garagification. Please wait.\n⠀')
			.setColor(client.colors[1])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}


		const descriptions = [];
		const symbols = [];
		const prices = [];

		for(const assets of collections) {
			let s = [];
			let p = [];
			for(const asset of assets) {
				let price = '';
				if(asset.sell_orders != undefined) {
					for(let i = 0; i < asset.sell_orders.length; i++) {
						if(asset.sell_orders[i].payment_token_contract.id == 1) {
							const eth = client.extra.price_calc(asset.sell_orders[0].base_price);
							price = eth + 'Ξ';
						}
					}
				}
				p.push(price);
				s.push('[' + asset.name + '](' + asset.permalink + ')');
			}
			prices.push(p);
			symbols.push(assets[0].asset_contract.symbol);
			descriptions.push(s);
		}

		const buffer = await makeCollageColumnPrices(collections, prices);
		const attachment = new MessageAttachment(buffer, 'garagesale.png');

		embed = new MessageEmbed()
			.setTitle(message.author.username + '\'s Garage Sale!')
			.setColor(client.colors[3])
			.setAuthor('🟢   Summon Completed!   🟢')
			.setImage('attachment://' + attachment.name);

		for(let i = 0; i < descriptions.length; i++) {
			for(let j = 0; j < descriptions[i].length; j += 10) embed.addField(symbols[i], ' ' + descriptions[i].slice(j, j + 10).join(' '));
		}

		try{await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}

		await client.extra.sleep(1000);

		

		try{await m.edit({ embeds: [embed], files: [attachment] }).then(client.extra.log_g(client.logger, message.guild, 'Nut Me Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Nut Me Command', 'Send Denied');}

		console.log('adsfgh');
	},
};