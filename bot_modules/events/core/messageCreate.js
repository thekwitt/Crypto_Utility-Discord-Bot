/* eslint-disable no-case-declarations */
const { Collection, MessageEmbed } = require('discord.js');
const cooldowns = new Map();

let sweepActive = false;

function getTime(time, mode) {
	time = Math.floor(time / 1000) + 1;
	if(mode == 1) return time % 60;
	else if (mode == 2) return Math.floor(time / 60) % 60;
	else if (mode == 3) return Math.floor(time / 3600);
}


async function commandFunctioner(message, client) {
	// Prepare Command Finder

	const perms = message.content.toLowerCase().split(' ');
	perms[0] = perms[0].replace('!', '');

	const authorPerms = message.channel.permissionsFor(message.author);

	const command = client.commands.get(perms[0]) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(perms[0]));

	if(command == undefined) return;

	if(command.permission && message.author.id != 198305088203128832) {
		if(!authorPerms || !authorPerms.has(command.permission)) {
			return;
		}
	}

	const commandName = command.name;

	if(!cooldowns.has(commandName)) {
		cooldowns.set(commandName, new Collection());
	}

	const current_time = Date.now();
	const time_stamps = cooldowns.get(commandName);
	const cooldown_amount = (command.cooldown) * 1000;

	// Check Member ID + Guild ID
	if(time_stamps.has(message.guildId)) {
		const expire_time = time_stamps.get(message.guildId) + cooldown_amount;

		if(current_time < expire_time) {
			// eslint-disable-next-line no-unused-vars
			const time_left = expire_time - current_time;
			await message.channel.send({ content: 'Looks like you\'ve used this command lately! Please wait ' + getTime(time_left, 2) + ' minutes ' + getTime(time_left, 1) + ' seconds!' }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'sweep'));
			return;
		}
	}

	time_stamps.set(message.guildId, current_time);
	cooldowns.set(commandName, time_stamps);
	setTimeout(() => time_stamps.delete(message.guildId), cooldown_amount);

	let embed = new MessageEmbed()
		.setTitle('🟡   Summon Processed!   🟡')
		.setDescription('⠀\n\n⠀')
		.setColor(client.colors[2])
		.setFooter('This usually takes 1 - 3 seconds.');

	const temp = await message.channel.send({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'sweep'));

	try {
		await command.execute(message, client, temp);
		if (message.reset_cooldown) time_stamps.delete(message.guildId);
	} catch (e) {
		embed = new MessageEmbed()
			.setTitle('🔴   Summon Canceled!   🔴')
			.setDescription('⠀\nLooks likes an error happened! Please try again!\n⠀')
			.setColor(client.colors[0])
			.setFooter('Feel free to try again!');

		time_stamps.delete(message.guildId);
		try{await temp.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
		catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}

		if (command.active) command.active = false;
		console.log(e);
	}

}

async function sweepManager(message, client) {
	if(message.channelId == 885586265192419348) {
		if(sweepActive == false) {
			sweepActive = true;
			let channel = undefined;
			const channels = await message.guild.channels.fetch();
			channel = channels.get('870415075947741244');

			const init = message.channel.createMessageCollector({ time: 7200000, max: 5 });

			init.on('end', async () => {
				if(init.collected.size >= 5) {
					await channel.send({ content: '<a:sweep:929601946795511899> SWEEP STARTED! EACH SALE GETS A SWEEP! GET YOUR BRROMS OUT FAM! <a:sweep:929601946795511899>' }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'sweep'));

					const collector = message.channel.createMessageCollector({ time: 300000 });
					collector.on('collect', async () => {
						collector.resetTimer({ time: 300000 });
						await channel.send({ content: '<a:sweep:929601946795511899>' }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'sweep'));
					});
					collector.on('end', async () => {
						await channel.send({ content: '<a:sweep:929601946795511899> LFG! THE SWEEP ENDED WITH ' + (collector.collected.size + 5) + ' SALES! <a:sweep:929601946795511899>' }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'sweep'));
						sweepActive = false;
					});
				} else {
					sweepActive = false;
				}
			});
		}
	}
}

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if(message.channel.type != 'DM' && message.author != undefined) {
			await sweepManager(message, client);
			if(message.content.toLowerCase().startsWith('!')) await commandFunctioner(message, client);

			/* Figure out Perms
			const authorPerms = message.channel.permissionsFor(message.author);
			if ((!authorPerms || !authorPerms.has('MANAGE_CHANNELS'))) {
				return;
			}
			*/

		} else if(message.channel.type == 'DM' && message.author != undefined) {
			if(message.content.toLowerCase().startsWith('!')) await commandFunctioner(message, client);
		}
	},
};