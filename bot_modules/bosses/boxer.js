/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');


function get_clock(timestamp, max) {

	const time = (1 - ((max - (timestamp - (Date.now() / 1000) - 10)) / max)) * 100;

	if(time > 90) return '🕐';
	else if(time > 80) return '🕑';
	else if(time > 70) return '🕓';
	else if(time > 60) return '🕔';
	else if(time > 50) return '🕕';
	else if(time > 40) return '🕗';
	else if(time > 30) return '🕘';
	else if(time > 20) return '🕙';
	else if(time > 10) return '🕚';
	else return '🕛';
}

function rowReturn(type, client, disable) {

	if(disable == undefined) disable = false;

	switch(type) {
	case 0: // Punch n Counter
		const target0 = client.extra.random(0, 6);
		const output0 = [];
		for(let j = 0; j < 2; j++) {
			const rows0 = new MessageActionRow();
			for(let i = 0; i < 3; i++) {
				if((j * 3) + i == target0) rows0.addComponents(new MessageButton().setCustomId('counter').setLabel('Counter!').setStyle('PRIMARY'));
				else rows0.addComponents(new MessageButton().setCustomId('mess' + (j * 3) + i).setLabel('⠀Miss!⠀').setStyle('SECONDARY'));
			}
			output0.push(rows0);
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return output0;

	case 1: // Regular 4 Button
		const target1 = client.extra.random(0, 4);
		const rows1 = new MessageActionRow();
		for(let i = 0; i < 4; i++) {
			if(i == target1) rows1.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER').setDisabled(disable));
			else rows1.addComponents(new MessageButton().setCustomId('miss' + i).setLabel('Miss!').setStyle('SECONDARY').setDisabled(disable));
		}

		if(client.extra.random(0, 100) > 90) rows1.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY').setDisabled(disable));
		return [rows1];

	case 2: // Dodge
		const rows2 = new MessageActionRow();
		for(let i = 0; i < 3; i++) {
			rows2.addComponents(new MessageButton().setCustomId('hit' + i).setLabel('Hit!').setStyle('DANGER').setDisabled(disable));
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return [rows2];
	}
}

module.exports = {
	async execute(message, client, interactionMessage) {

		const strings = message.content.toLowerCase().split(' ');

		let embed = undefined;

		let assets = [];

		try {
			assets = await client.extra.getBasicAssets(client, strings[2], strings[1]);
			assets = assets.assets;
		} catch {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nOpensea rejected the summon!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await interactionMessage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		if(isNaN(strings[3]) == true) {
			embed = new MessageEmbed()
				.setTitle('🔴   Summon Canceled!   🔴')
				.setDescription('⠀\nLooks like that was not a number! Make sure that the health is a number!\n⠀')
				.setColor(client.colors[0])
				.setFooter('Feel free to try again!');

			try{await interactionMessage.edit({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Skull Bundle Command', 'Bot Send'));}
			catch{client.extra.log_error_g(client.logger, message.guild, 'Skull Bundle Command', 'Send Denied');}
			return;
		}

		const health = Number(strings[3]);

		this.active = true;

		const asset = assets[0];

		let rows = rowReturn(0, client);

		const ambushRow = [
			new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('ambush')
						.setLabel('Ambush!')
						.setStyle('DANGER'),
				)];

		strings[4] = Number(strings[4]) + 5;

		let endts = (Date.now() / 1000) + (Number(strings[4]) + 10);
		let phase = 0;
		const ambush = [];
		let stunned = [];
		let cast_yes = [];
		let cast_no = [];
		let cast_name = [];
		const stun = new Map();
		let users = new Map();
		const user_damage = new Map();
		const user_miss = new Map();
		let damage = 0;
		let sec_limit = 5;

		let combatEmbed = new MessageEmbed()
			.setColor(client.colors[1])
			.setTitle('Action Belt')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.addFields(
				{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
				{ name: 'Time', value: get_clock(endts, Number(strings[4])), inline: true },
			)
			.setDescription('The boss is warming up for a series of attacks!')
			.setFooter('Get ready!');


		embed = new MessageEmbed()
			.setColor(client.colors[2])
			.setTitle('A Boss is being summoned!')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('It looks like an NFT is being summoned!')
			.setFooter('Ambush the boss to start with extra damage!')
			.setImage(asset.image_url);

		let channel = undefined;
		channel = await message.guild.channels.cache.get(interactionMessage.channel.id);
		try{ interactionMessage.edit({ embeds: [embed], components: ambushRow }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss First Send - ')); }
		catch {
			client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Boss Send Denied');
		}

		const filter = i => {
			if(interactionMessage != undefined) return i.message.id == interactionMessage.id;
		};

		const collector = await channel.createMessageComponentCollector({ filter, time: 1000 * Number(strings[4]) });

		collector.on('collect', async i => {

			if(phase == 0) {
				if(i.customId === 'ambush') {
					if(ambush.includes(i.user.id)) {
						try{ await i.reply({ content: 'You already prepared for ambush! Wait for the boss fight to start!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else {
						// eslint-disable-next-line max-statements-per-line
						try { await i.deferUpdate(); } catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Ended Hit');}

						ambush.push(i.user.id);
					}
				}
			} else {
				users.set(i.user.id, (Date.now() / 1000) + 3);
				if(!user_miss.has(i.user.id)) user_miss.set(i.user.id, 0);
				if (i.customId.startsWith('hit') || i.customId === 'superhit') {
					if(stun.has(i.user.id)) {
						if(stun.get(i.user.id) - Math.floor(Date.now() / 1000) <= 0) {
							stun.delete(i.user.id);

							let x = users.size;

							if(x == 0) x = 1;

							let hit = 1 / x;

							if(i.customId === 'superhit') hit = 0.03 * health;

							if(!user_damage.has(i.user.id)) user_damage.set(i.user.id, hit);
							else user_damage.set(i.user.id, user_damage.get(i.user.id) + hit);

							damage += hit;
							if(damage >= health) {
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Ended Hit');}
								collector.stop();
							} else {
								// eslint-disable-next-line no-lonely-if
								if(i.customId.startsWith('hit')) {
									try { await i.deferUpdate(); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
								} else if(i.customId === 'superhit') {
									try{ await i.reply({ content: 'Nice! You super hit the boss for 3% !', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
									rows[0].components[rows[0].components.length - 1].setDisabled(true);
									if(damage < health) {
										try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Super Attack Edit'));}
										catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
									}
								}
							}
						} else if (stun.get(i.user.id) - Math.floor(Date.now() / 1000) > 0) {
							try{ await i.reply({ content: 'You can\'t attack for ' + (stun.get(i.user.id) - Math.floor(Date.now() / 1000)) + ' more seconds!', ephemeral: true }); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
						}
					} else {
						let x = users.size;
						if(x == 0) x = 1;
						let hit = 1 / x;
						if(i.customId === 'superhit') hit = 0.03 * health;
						if(!user_damage.has(i.user.id)) user_damage.set(i.user.id, hit);
						else user_damage.set(i.user.id, user_damage.get(i.user.id) + hit);

						damage += hit;
						if(damage >= health) {
							try { await i.deferUpdate(); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Ended Hit');}
							collector.stop();
						} else {
							// eslint-disable-next-line no-lonely-if
							if(i.customId.startsWith('hit')) {
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
							} else if(i.customId === 'superhit') {
								try{ await i.reply({ content: 'Nice! You super hit the boss for 3% !', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
								rows[0].components[rows[0].components.length - 1].setDisabled(true);
								if(damage < health) {
									try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Super Attack Edit'));}
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
								}
							}
						}
					}
				} else if(i.customId.startsWith('miss')) {
					if(stun.has(i.user.id) && stun.get(i.user.id) - Math.floor(Date.now() / 1000) > 0) {
						try{ await i.reply({ content: 'You can\'t attack for ' + (stun.get(i.user.id) - Math.floor(Date.now() / 1000)) + ' more seconds!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else {
						stun.set(i.user.id, Math.floor(Date.now() / 1000) + 4);
						setTimeout(() => stun.delete(i.user.id), 3000);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You missed an attack and got knocked out for three seconds! You have to wait three seconds before you can attack again!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}
				} else if(i.customId.startsWith('mess')) {
					if (stunned.includes(i.user.id)) {
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to counter!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_no.push(i.user.id);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You failed to counter and were left wide open for the attack! Brace yourself!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried countering!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				} else if(i.customId.startsWith('counter')) {
					if (stunned.includes(i.user.id)) {
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to counter!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_yes.push(i.user.id);
						cast_name.push(i.user.username);
						// eslint-disable-next-line max-statements-per-line
						try{ await i.reply({ content: 'You get into counter stance!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried countering', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				}
			}
		});

		try {
		// eslint-disable-next-line no-unused-vars
			collector.on('end', async i => {
				const sortedDamage = new Map([...user_damage.entries()].sort((a, b) => b[1] - a[1]));
				const arraySortedDamage = Array.from(sortedDamage.keys());

				if(user_damage.size == 0) {
					const end = new MessageEmbed()
						.setColor(client.colors[0][1])
						.setTitle('The Boss Left!')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n**No one tried to stop the boss and claimed victory over the server!**\n⠀')
						.setFooter('Try to fight it next time!')
						.setImage();
					try{await interactionMessage.edit({ embeds: [end], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Empty Edit'));}
					catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}
				} else {
					let string = 'Oh no! The boss couldn\'t be defeated in time and claimed victory over the server!!**';
					let members = channel.guild.members.cache;

					if (channel.guild.memberCount > members.size)
					{
						try{members = await channel.guild.members.fetch().then(client.extra.log_g(client.logger, channel.guild, 'LB Command', 'Member Fetch'));}
						catch {client.extra.log_error_g(client.logger, channel.guild, 'LB Command', 'Fetch Denied');}
					}
					if(damage >= health) {
						let dmgString = '```css\n[Rank] | {.Dmg / Miss.} | Degen\n==========================================\n';
						string = 'You defeated the ' + asset.name + ' boss!';

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n';
						}

						dmgString += '```';
						const end = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('The boss is defeated!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + string + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.message.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Win 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}
						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Win 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied - ' + err.toString());}
								}
							}
						});
						try {
							// eslint-disable-next-line no-unused-vars
							viewcollector.on('end', async j => {
								return;
							});
						} catch { return; }

					} else {
						let dmgString = '```css\n[Rank] | {.Dmg / Miss.} | Degen\n==========================================\n';

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n';
						}

						dmgString += '```';

						const end = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('The boss defeated the server!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n**' + string + '\n⠀')
							.setFooter('Next time work together to defeat the boss!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.message.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Defeated 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Defeated 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied - ' + err.toString());}
								}
							}
						});
						try {
							// eslint-disable-next-line no-unused-vars
							viewcollector.on('end', async j => {
								return;
							});
						} catch { return; }
					}
				}
				return;

			});
		} catch {
			client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Failed From No Cache');
		}

		let second = 0;


		while (damage < health && collector.ended == false) {
			if(phase == 1 && (100 - Math.floor((damage / health) * 100)) < 55) {
				second = 0;
				phase = 2;

				const time = endts - (Date.now() / 1000);

				embed = new MessageEmbed()
					.setColor(client.colors[0])
					.setTitle('Boss: ' + asset.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('**Woah! The boss is starting to get hyped up!**')
					.setFooter('Looks like the fight is about to get harder!')
					.setImage(asset.image_url);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(8000);

				sec_limit = client.extra.random(5, 8);
				combatEmbed = new MessageEmbed()
					.setColor(client.colors[1])
					.setTitle('Action Belt')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addFields(
						{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
						{ name: 'Time', value: get_clock(endts, Number(strings[4])), inline: true },
					)
					.setDescription('Press the **Hit!** button to attack the boss!')
					.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

				embed = new MessageEmbed()
					.setColor(client.colors[3])
					.setTitle('Boss: ' + asset.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('The boss is getting serious now!')
					.setFooter('(Hint: 5 clicks per 5 seconds before it tells you to slow down!)')
					.setImage(asset.image_url);

				rows = rowReturn(1, client);

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
				endts = (Date.now() / 1000) + time + 6;
				collector.resetTimer({ time: time * 1000 });
			}
			else if(phase == 1) {

				await client.extra.sleep(1000);
				if(this.active == false) break;

				second++;

				if(damage < health && collector.ended == false) {
					if(second >= sec_limit) {
						const tracked = Array.from(users.keys());
						let string = '';
						sec_limit = 1;
						if(cast_yes.length > 0) string = cast_name.join(', ') + ' countered the attack and the boss took some damage!\n\n';

						cast_no = [];
						cast_name = [];
						cast_yes = [];
						second = 0;
						rows = rowReturn(0, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, Number(strings[4])), inline: true },
							)
							.setDescription(string + 'The boss attacks! **Counter** it!')
							.setFooter('You have 5 seconds to counter.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}

						await client.extra.sleep(5000);

						for(let [key, value] of users.entries()) {
							if(value < (Date.now() / 1000)) {
								users.delete(key);
							}
						}

						stunned = [];

						const size = (users.size > 0 ? users.size : 1);

						if(cast_yes.length > 0) damage += size * 5 * cast_yes.length;

						for(const user of cast_yes) {
							if(!user_damage.has(user)) user_damage.set(user, size * 5);
							else user_damage.set(user, user_damage.get(user) + size * 5);
						}

						for(const user of tracked) {
							if(cast_yes.includes(user) == false) stunned.push(user);
						}

						for(const user of cast_no) {
							stunned.push(user);
						}
					}
				} else {break;}
			} else if(phase == 2) {
				await client.extra.sleep(1000);

				if(this.active == false) break;

				second++;
				for(let [key, value] of users.entries()) {
					if(value < (Date.now() / 1000)) {
						users.delete(key);
					}
				}

				if(damage < health && collector.ended == false) {
					if(second >= sec_limit) {
						sec_limit = client.extra.random(5, 8);
						second = 0;
						rows = rowReturn(1, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, Number(strings[4])), inline: true },
							)
							.setDescription('Press the **Hit!** button to attack the boss!')
							.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}
					}
				} else {break;}
			} else if (phase == 0) {
				await client.extra.sleep(5000);

				embed = new MessageEmbed()
					.setColor(client.colors[3])
					.setTitle('Boss: ' + asset.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('The boss is starting to get rough!')
					.setFooter('(Hint: 5 clicks per 5 seconds before it tells you to slow down!)')
					.setImage(asset.image_url);

				phase = 1;

				if(ambush.length >= 1) {
					damage += 1;

					for(let j = 0; j < ambush.length; j++) {
						let x = ambush.length;
						let hit = 1 / x;
						if(!user_damage.has(ambush[j])) user_damage.set(ambush[j], hit);
						else user_damage.set(ambush[j], user_damage.get(ambush[j]) + hit);

						users.set(ambush[j], (Date.now() / 1000) + 3);
					}
				}

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

			}

			if(damage > health) {
				collector.stop();
				break;
			}
		}
	},
};