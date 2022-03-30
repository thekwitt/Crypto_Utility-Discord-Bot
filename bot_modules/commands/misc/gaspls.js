const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'whatisminting',
	alias: ['whosminting', 'whatmint', 'testmint'],
	async execute(message, client, m) {

		let embed = new MessageEmbed()
			.setTitle('🟡   Summon Processed!   🟡')
			.setDescription('⠀\nThank you for your order! We will see who is hogging all the gas!\n⠀')
			.setColor(client.colors[2])
			.setFooter('This usually takes 3 - 30 seconds.');

		try{m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		const contracts = [];

		const exempt = ['0xcCA03DD3843079e0BEb0e98E0d7A946556caA097', '0x7f268357A8c2552623316e2562D90e642bB538E5', '0x990f341946A3fdB507aE7e52d17851B87168017c', '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xe66B31678d6C16E9ebf358268a790B763C133750', '0xc4CcDdcd0239D8425b54322e8E5F99D19FB7Ba43', '0xFbdDaDD80fe7bda00B901FbAf73803F2238Ae655', '0xc8C3CC5be962b6D281E4a53DBcCe1359F76a1B85', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xa5409ec958C83C3f309868babACA7c86DCB077c1', '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b', '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5'];

		const addresses = client.addresses.map(x => x.value);

		for(let i = 0; i < addresses.length; i++) {
			try {
				if(exempt.map(x => x.toLowerCase()).includes(addresses[i].toLowerCase()) == false) contracts.push(addresses[i]);
			} catch {;}
		}

		const counts = {};

		contracts.forEach(function(x) { counts[x] = (counts[x] || 0) + 1; });

		const sortable = [];

		for (const trans in counts) {
			sortable.push([trans, Math.round((counts[trans] / contracts.length) * 100)]);
		}


		sortable.sort(function(a, b) {
			return a[1] - b[1];
		}).reverse();

		embed = new MessageEmbed()
			.setColor(client.colors[3])
			.setAuthor('🟢   Summon Completed!   🟢');

		let count = 0;
		let limit = 5;

		for(let i = 0; i < limit; i++) {
			if(sortable[i] == undefined) break;

			const data = await client.extra.getJsonEther('https://api.etherscan.io/api?module=contract&action=getsourcecode&address=' + sortable[i][0]);

			if(data.result[0].ContractName != '') {
				try {
					count += 1;

					const tokenContract = new client.web3.eth.Contract(JSON.parse(data.result[0].ABI), sortable[i][0]);
					const name = await tokenContract.methods.name().call();

					embed.addField(name, '[' + sortable[i][0] + '](https://etherscan.io/address/' + sortable[i][0] + ')\n\n' + '**' + sortable[i][1] + '%** of ' + contracts.length + ' transactions\n⠀');
				} catch {
					limit++;
				}
			}
		}

		embed.setTitle('Top ' + count + ' Contracts');
		embed.setDescription('⠀');

		if(count == 0) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nThere we no NFTs found!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again in one minute!');

			try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		try{return await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Command', 'Send Denied');}

	},
};