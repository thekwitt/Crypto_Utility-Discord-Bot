/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'boss',
	alias: [],
	active: false,
	permission: 'MANAGE_CHANNELS',
	guide: '!boss [Collection Name] [Token ID] [Health] [Duration in Seconds] [Battle Type (0 - Boxer Fight, 1 - Caster Fight, 2 - Extreme Fight, 3 - Tank Fight, 4 - Thief Fight)] (MODS ONLY)',
	async execute(message, client, interactionMessage) {

		if(message.content.toLowerCase() === '!boss') {
			try{return await interactionMessage.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		if(this.active == true) {
			const embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nThere is already a boss active!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await interactionMessage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}


		this.active = true;

		const strings = message.content.toLowerCase().split(' ');

		await client.bosses[Number(strings[5])].execute(message, client, interactionMessage);

		this.active = false;
	},
};