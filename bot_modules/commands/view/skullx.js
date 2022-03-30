const { MessageEmbed } = require('discord.js');

const guide = '!skullx [SkullX Token ID] or !s [SkullX Token ID]\n\nEx: !skullx 1234 or !s 1234';

module.exports = {
	name: 's',
	alias: [''],
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');
		if(strings[1] == undefined) {
			try{return await m.edit({ content: guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
		}

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! Your skullx is being summoned through ' + (client.extra.random(0, 101) > 95 ? 'brokensea' : 'opensea') + '!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 1 - 3 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		if(isNaN(strings[1]) == true) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nLooks like that was not a number! Make sure that the Token ID is a number!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		const id = Number(strings[1]);

		if(id > 10000 || id < 1) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nThe Token ID give was not within the skullx range!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;

		}

		const reform = id;

		let assets = undefined;
		try {
			assets = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?include_orders=true&order_direction=desc&token_ids=' + reform + '&limit=1&asset_contract_address=0x1dc5d3b2162f9500d7ddec14eb0ba9ccb43bc20c');
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

		if (assets.length == 0 || assets == undefined) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nOpensea rejected the summon!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		const asset = assets.assets[0];

		embed = new MessageEmbed()
			.setTitle(asset.name)
			.setColor(client.colors[3])
			.setAuthor('🟢   Summon Completed!   🟢')
			.setURL(asset.permalink)
			.setImage(asset.image_url);

		if(asset.owner.user == undefined) embed.setDescription('Owned by ' + asset.owner.address);
		else if(asset.owner.user.username != undefined) embed.setDescription('Owned by ' + asset.owner.user.username + ' | ' + asset.owner.address);
		else embed.setDescription('Owned by ' + asset.owner.address);

		const skull_Ts = asset.traits;

		// Realm Setup
		const r_index = skull_Ts.map(e => e.trait_type).indexOf('Realm');

		if (skull_Ts[r_index].value == 'Nether') {
			try{return await message.channel.send({ content: 'Looks like opensea rejected the skull you were trying to view! Try this command again.' }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bad Nether Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Reply Denied');}
		}

		embed.addField('Realm', skull_Ts[r_index].value, false);
		// Traits
		for(let j = 0; j < skull_Ts.length; j++) {
			const type = skull_Ts[j].trait_type;

			if(type != 'Realm') {
				embed.addField(type, skull_Ts[j].value + ' (' + ((skull_Ts[j].trait_count / 10000) * 100).toFixed(2) + '%)', true);
			}
		}

		// Sale
		embed.addField('\u200B', '\u200B');

		if(asset.sell_orders != undefined) {
			for(let i = 0; i < asset.sell_orders.length; i++) {
				if(asset.sell_orders[i].payment_token_contract.symbol != 'WETH') {
					const eth = client.extra.price_calc(asset.sell_orders[i].base_price);
					const usd = client.extra.usd_calc(asset.sell_orders[i].payment_token_contract.usd_price, eth);
					embed.addField('Available for sale now!', '**' + eth + 'Ξ** *($' + usd + ')*', true);
				}
				/*
				if(asset.sell_orders[i].sale_kind == 1) {
					const eth = client.extra.price_calc(asset.sell_orders[i].base_price);
					const usd = client.extra.usd_calc(asset.sell_orders[i].payment_token_contract.usd_price, eth);
					embed.addField('Available for auction now!', '**' + eth + 'Ξ** *($' + usd + ')*', true);
				}
				*/
			}
		} else if (asset.last_sale != undefined) {
			const eth = client.extra.price_calc(asset.last_sale.total_price);
			const usd = client.extra.usd_calc(asset.last_sale.payment_token.usd_price, eth);
			embed.addField('Last Sold For', '**' + eth + 'Ξ** *($' + usd + ')*', true);
		}

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/bundles?token_ids=' + id + '&asset_contract_address=0x1dc5d3b2162f9500d7ddec14eb0ba9ccb43bc20c');
		const bundle = data.bundles[0];

		if(bundle != undefined) {
			embed.addField('Also available for a bundle!', '[' + bundle.name + '](' + bundle.permalink + ')', true);
		}

		const rarity = await client.extra.rarityCalculate(asset, client, 'skullx');

		embed.addField('Rarity Score', ' ' + rarity.toFixed(2), true);

		try{return await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Send Denied');}
	},
};