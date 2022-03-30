// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, Collection, MessageEmbed } = require('discord.js');
const cooldowns = new Map();

function getTime(time, mode) {
	time = Math.floor(time / 1000) + 1;
	if(mode == 1) return time % 60;
	else if (mode == 2) return Math.floor(time / 60) % 60;
	else if (mode == 3) return Math.floor(time / 3600);
}

module.exports = {
	name: 'interactionCreate',

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */

	async execute(interaction, client) {
		if(client.ready.every(v => v === true)) {
			if(interaction.inGuild() && interaction.guild != undefined) {
				const guildID = interaction.guildId;
				if (!interaction.isCommand()) return;

				const { commandName } = interaction;

				if (!client.commands.has(commandName)) return;

				if (!interaction.guild) return;

				const settings = client.extra.getDB();
				const authorPerms = interaction.channel.permissionsFor(interaction.member);

				if ((!authorPerms || !authorPerms.has('MANAGE_CHANNELS')) && settings.exclude_cmd_channels.includes(interaction.channelId)) {
					try{return await interaction.reply({ content: 'Looks like this channel is locked from using slash commands on this bot! Try another channel.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'No Channel Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}
				}

				// Check Channel ID
				const command = client.commands.get(interaction.commandName);

				if(!cooldowns.has(commandName)) {
					cooldowns.set(commandName, new Collection());
				}

				const current_time = Date.now();
				const time_stamps = cooldowns.get(commandName);
				const cooldown_amount = (command.cooldown) * 1000;

				// Check Member ID + Guild ID
				if(time_stamps.has(interaction.member.id + '' + guildID)) {
					const expire_time = time_stamps.get(interaction.member.id + '' + guildID) + cooldown_amount;

					if(current_time < expire_time) {
						// eslint-disable-next-line no-unused-vars
						const time_left = expire_time - current_time;
						if(getTime(time_left, 3) > 0) {
							try{return await interaction.reply({ content: 'Looks like you\'ve used this command lately! Please wait ' + getTime(time_left, 3) + ' hours ' + getTime(time_left, 2) + ' minutes ' + getTime(time_left, 1) + ' seconds!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'Cooldown Reply'));}
							catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}
						}
						try{return await interaction.reply({ content: 'Looks like you\'ve used this command lately! Please wait ' + getTime(time_left, 2) + ' minutes ' + getTime(time_left, 1) + ' seconds!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'Cooldown Reply'));}
						catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}
					}
				}

				time_stamps.set(interaction.member.id + '' + guildID, current_time);
				cooldowns.set(commandName, time_stamps);
				setTimeout(() => time_stamps.delete(interaction.member.id + '' + interaction.guildId), cooldown_amount);


				try {
					if(interaction.member.id == 198305088203128832) {
						try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', commandName + ' - Execution')); }
						catch(err) {
							await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
							time_stamps.delete(interaction.member.id + '' + guildID);
							client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
							client.extra.simple_log(client.logger, String(err));
						}
					} else if(command.permission) {
						if(!authorPerms || !authorPerms.has(command.permission)) {
							const bucketEmbed = new MessageEmbed()
								.setColor('RED')
								.setTitle('You don\'t have permission to use this command.')
								.setDescription('You need the ability to ' + command.permission + ' to use this!')
								.setFooter('If you encounter anymore problems, please join https://discord.gg/BYVD4AGmYR and tag TheKWitt!');
							try{await interaction.reply({ embeds: [bucketEmbed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'Invalid Perms Reply'));}
							catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}

						// eslint-disable-next-line max-statements-per-line
						} else {
							try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', commandName + ' - Execution')); }
							catch(err) {
								await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
								time_stamps.delete(interaction.member.id + '' + guildID);
								client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
								client.extra.simple_log(client.logger, String(err));
							}
						}
					// eslint-disable-next-line max-statements-per-line
					} else {
						try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', commandName + ' - Execution')); }
						catch (err) {
							await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
							time_stamps.delete(interaction.member.id + '' + guildID);
							client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
							client.extra.simple_log(client.logger, String(err));
						}
					}

					if (interaction.reset_cooldown) time_stamps.delete(interaction.member.id + '' + guildID);

				} catch (error) {
					console.error(error);
					try{await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'Error Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}
				}
			}
		} else {
			try{await interaction.reply({ content: 'The bot is restarting! Please wait 10 seconds.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Interaction Create Event', 'Restarting Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Interaction Create Event', 'Reply Denied');}
		}
	},
};