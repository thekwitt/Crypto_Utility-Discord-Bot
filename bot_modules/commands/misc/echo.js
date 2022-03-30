module.exports = {
	name: 'echo',
	alias: [],
	permission: 'MANAGE_CHANNELS',
	guide: '!echo [Channel] [Message] (MODS ONLY)',
	async execute(message, client, m) {
		const strings = message.content.toLowerCase().split(' ');
		if(strings[2] == undefined) {
			try{return await m.edit({ content: this.guide, embeds: [] }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
			catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
			return;
		}

		const channel = message.mentions.channels.first();

		try{return await channel.send({ content: message.content.split(' ').slice(2).join(' ') }).then(client.extra.log_g(client.logger, message.guild, this.name + ' Command', 'No Parm Reply'));}
		catch{client.extra.log_error_g(client.logger, message.guild, this.name + ' Command', 'Reply Denied');}
		return;

	},
};