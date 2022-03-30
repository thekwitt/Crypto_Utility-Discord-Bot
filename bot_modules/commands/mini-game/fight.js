const { MessageAttachment, MessageEmbed } = require('discord.js');

function checkWin(NFT1, NFT2) {
	if(NFT1.every(n => n.health <= 0))
		return 1;
	else if(NFT2.every(n => n.health <= 0))
		return 2;
	return 0;
}

module.exports = {
	name: 'verify',
	alias: ['g'],
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

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?' + new_ids.join('&') + '&collection=' + collection);

		const NFTs = [];

		for(const asset of data.assets) {
			NFTs.push({ asset: asset, health: 100 });
		}

		const NFTTeam1 = NFTs.slice(0, 2);
		const NFTTeam2 = NFTs.slice(0, 2);

		embed = new MessageEmbed()
			.setTitle('🟠   Fight Commencing   🟠')
			.setDescription('⠀\nAssets processed! Preparing battlefield!\n⠀')
			.setColor(client.colors[1])
			.setFooter('Hype!');

		try{await m.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		await client.extra.sleep(5000);

		const leftTurn = client.extra.getRandom([true, false]);

		while(checkWin(NFTTeam1, NFTTeam2) == 0) {
			if(leftTurn) {
				const checkTeam = NFTTeam2.filter(n => n.health > 0);
				
			}
		}

	},
};