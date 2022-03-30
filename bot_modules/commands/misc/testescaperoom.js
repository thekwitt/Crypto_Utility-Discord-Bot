const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, Message } = require('discord.js');

let checker = (arr, target) => target.every(v => arr.includes(v));

function removeFromArray(array, element) {
	const index = array.indexOf(element);
	return array.splice(index, 1);
}

module.exports = {
	name: 'testescaperoom',
	alias: [],
	permission: 'MANAGE_CHANNELS',
	async execute(message, client, interactionMessage) {
		const intro = 'During a silent a peaceful night, you walk back home after buying a bunch of groceries from the local mart. It\'s only been a month since you moved into the city and it still feels like yesterday you moved out of town.\n\nAs you are walking, suddenly, a white van stops beside you and a group of masks vigilantes grab you and throw you into the truck. You slowly black out from the impact, listening to the noise of screaming individuals around you.\n\nYou wake up on a stone bed and find yourself trapped inside a abandoned cabin. Suddenly, you feel as if you have 5 minutes to escape before something bad happens.';

		let front = true;
		let win = false;

		let inventory = []; // 1 - Key, 2 3 4 - Flask, 5 - Jar, 6 - Acid

		const shelves = [false, false, false, false]; // BL, TL, TR, BR
		let alcCabinet = false;
		let usedMachine = false;
		let safe = false;
		let secondPaper = false;
		let clutchPhase = false;


		let row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('start')
					.setLabel('Start Escape')
					.setStyle('SUCCESS')
					.setDisabled(false),
			);

		let actionRow = undefined;

		let shelfRow = undefined;

		let embed = new MessageEmbed()
			.setTitle('A New Adventure Begins')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\n' + intro + '\n⠀')
			.setFooter('You will have 5 minutes to escape the cabin.');

		try {await interactionMessage.edit({ embeds: [embed], components: [row] }); }
		catch{client.extra.log_error_g(client.logger, message.guild, 'EscapeRoom', '1');}

		const filter = j => {
			return j.user.id == interaction.user.id;
		};


		const collector = interactionMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 300000 });

		collector.on('collect', async i => {

			switch (i.customId) {
			case 'start':
				i.deferUpdate();
				collector.resetTimer({ time: 300000 });
				row.setComponents(
					new MessageButton()
						.setCustomId('behind')
						.setLabel('Look Behind')
						.setStyle('PRIMARY')
						.setDisabled(false),
					new MessageButton()
						.setCustomId('inventory')
						.setLabel('Inventory')
						.setStyle('PRIMARY')
						.setDisabled(false),
				);

				actionRow = new MessageActionRow();

				if(clutchPhase == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('doorchained')
							.setLabel('Inspect Door')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}
				else {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('doorchained')
							.setLabel('Inspect Door')
							.setStyle('DANGER')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('flesh')
							.setLabel('Inspect Flesh')
							.setStyle('DANGER')
							.setDisabled(false),
					);
				}

				if(alcCabinet == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('alccabinet')
							.setLabel('Inspect Cabinet')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}

				if(usedMachine == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('usedmachine')
							.setLabel('Inspect Workstation')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}

				embed = new MessageEmbed()
					.setTitle('Viewing The Front of the Cabin')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription((clutchPhase == false ? '⠀\nYou stand towards the front of the cabin. Before you is a chained door and a alchemy workstation with a cabinet above it.\n⠀' : '⠀\nYou stand towards the front of the cabin. Before you is a unchained door with fleshy walls beside it. You feel uneasy by the image.\n⠀'))
					.setFooter('Click a button below!');

				await interactionMessage.edit({ embeds: [embed], components: [row, actionRow] });
				break;
			case 'front':
				i.deferUpdate();
				front = true;
				row.setComponents(
					new MessageButton()
						.setCustomId('behind')
						.setLabel('Look Behind')
						.setStyle('PRIMARY')
						.setDisabled(false),
					new MessageButton()
						.setCustomId('inventory')
						.setLabel('Inventory')
						.setStyle('PRIMARY')
						.setDisabled(false),
				);

				actionRow = new MessageActionRow();

				if(clutchPhase == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('doorchained')
							.setLabel('Inspect Door')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}
				else {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('doorchained')
							.setLabel('Inspect Door')
							.setStyle('DANGER')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('flesh')
							.setLabel('Inspect Flesh')
							.setStyle('DANGER')
							.setDisabled(false),
					);
				}

				if(alcCabinet == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('alccabinet')
							.setLabel('Inspect Cabinet')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}

				if(usedMachine == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('usedmachine')
							.setLabel('Inspect Machine')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}

				embed = new MessageEmbed()
					.setTitle('Viewing The Front of the Cabin')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription((clutchPhase == false ? '⠀\nYou stand towards the front of the cabin. Before you is a chained door and a alchemy workstation with a cabinet above it.\n⠀' : '⠀\nYou stand towards the front of the cabin. Before you is a unchained door with fleshy walls beside it. You feel uneasy by the image.\n⠀'))
					.setFooter('Click a button below!');

				await interactionMessage.edit({ embeds: [embed], components: [row, actionRow] });
				break;
				
			case 'behind':
				i.deferUpdate();
				front = false;
				row.setComponents(
					new MessageButton()
						.setCustomId('front')
						.setLabel('Look Infront')
						.setStyle('PRIMARY')
						.setDisabled(false),
					new MessageButton()
						.setCustomId('inventory')
						.setLabel('Inventory')
						.setStyle('PRIMARY')
						.setDisabled(false),
				);

				actionRow = new MessageActionRow();
				shelfRow = new MessageActionRow();

				for(let x = 0; x < shelves.length; x++) {
					const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
					if(shelves[x] == false) {
						shelfRow.addComponents(
							new MessageButton()
								.setCustomId('shelf' + x)
								.setLabel('Inspect ' + shelf_names[x])
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					} else {
						shelfRow.addComponents(
							new MessageButton()
								.setCustomId('shelf' + x)
								.setLabel('Inspect ' + shelf_names[x])
								.setStyle('SECONDARY')
								.setDisabled(true),
						);
					}
				}

				actionRow.addComponents(
					new MessageButton()
						.setCustomId('paperone')
						.setLabel('Inspect Note')
						.setStyle('SECONDARY')
						.setDisabled(false),
				);

				if(safe == false) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('safe')
							.setLabel('Inspect Safe')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}
				
				if(secondPaper == true) {
					actionRow.addComponents(
						new MessageButton()
							.setCustomId('papertwo')
							.setLabel('Inspect Secret Note')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);
				}


				embed = new MessageEmbed()
					.setTitle('Viewing The Back of the Cabin')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
					.setFooter('Click a button below!');

				await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow], ephemeral: true });
				break;

			case 'shelf1':
				if(inventory.includes(1)) {
					inventory.push(3);
					shelves[1] = true;
					await i.reply({ content: 'You use the key on the top left drawer and find a flask labeled number two on it.', ephemeral: true });
					front = false;
					row.setComponents(
						new MessageButton()
							.setCustomId('front')
							.setLabel('Look Infront')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();
					shelfRow = new MessageActionRow();

					for(let x = 0; x < shelves.length; x++) {
						const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
						if(shelves[x] == false) {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						} else {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(true),
							);
						}
					}

					actionRow.addComponents(
						new MessageButton()
							.setCustomId('paperone')
							.setLabel('Inspect Note')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);

					if(safe == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('safe')
								.setLabel('Inspect Safe')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(secondPaper == true) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('papertwo')
								.setLabel('Inspect Secret Note')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Back of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow]});

				} else {
					await i.reply({ content: 'You try to open the drawer but it seems stuck. Looks like you may need a key to open any of the drawer on this desk.', ephemeral: true });
				}
				break;
			
			case 'shelf2':
				if(inventory.includes(1)) {
					inventory.push(5);
					shelves[2] = true;
					await i.reply({ content: 'You use the key on the top right drawer and find a jar inside. You retrieved the item thinking you can use it later.', ephemeral: true });
					front = false;
					row.setComponents(
						new MessageButton()
							.setCustomId('front')
							.setLabel('Look Infront')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();
					shelfRow = new MessageActionRow();

					for(let x = 0; x < shelves.length; x++) {
						const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
						if(shelves[x] == false) {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						} else {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(true),
							);
						}
					}

					actionRow.addComponents(
						new MessageButton()
							.setCustomId('paperone')
							.setLabel('Inspect Note')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);

					if(safe == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('safe')
								.setLabel('Inspect Safe')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(secondPaper == true) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('papertwo')
								.setLabel('Inspect Secret Note')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Back of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow]});

				} else {
					await i.reply({ content: 'You try to open the drawer but it seems stuck. Looks like you may need a key to open any of the drawer on this desk.', ephemeral: true });
				}
				break;
			
			case 'shelf3':
				if(inventory.includes(1)) {
					secondPaper = true;
					shelves[3] = true;
					await i.reply({ content: 'You use the key on the bottom right drawer and find another piece of paper. You put it on the desk for the you to remember later.', ephemeral: true });
					front = false;
					row.setComponents(
						new MessageButton()
							.setCustomId('front')
							.setLabel('Look Infront')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();
					shelfRow = new MessageActionRow();

					for(let x = 0; x < shelves.length; x++) {
						const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
						if(shelves[x] == false) {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						} else {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(true),
							);
						}
					}

					actionRow.addComponents(
						new MessageButton()
							.setCustomId('paperone')
							.setLabel('Inspect Note')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);

					if(safe == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('safe')
								.setLabel('Inspect Safe')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(secondPaper == true) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('papertwo')
								.setLabel('Inspect Secret Note')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Back of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow]});

				} else {
					await i.reply({ content: 'You try to open the drawer but it seems stuck. Looks like you may need a key to open any of the drawer on this desk.', ephemeral: true });
				}
				break;
			
			case 'shelf0':
				if(inventory.includes(1)) {
					shelves[0] = true;
					await i.reply({ content: 'You use the key on the bottom left drawer and only find a spec of dust and lint.', ephemeral: true });
					front = false;
					row.setComponents(
						new MessageButton()
							.setCustomId('front')
							.setLabel('Look Infront')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();
					shelfRow = new MessageActionRow();

					for(let x = 0; x < shelves.length; x++) {
						const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
						if(shelves[x] == false) {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						} else {
							shelfRow.addComponents(
								new MessageButton()
									.setCustomId('shelf' + x)
									.setLabel('Inspect ' + shelf_names[x])
									.setStyle('SECONDARY')
									.setDisabled(true),
							);
						}
					}

					actionRow.addComponents(
						new MessageButton()
							.setCustomId('paperone')
							.setLabel('Inspect Note')
							.setStyle('SECONDARY')
							.setDisabled(false),
					);

					if(safe == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('safe')
								.setLabel('Inspect Safe')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(secondPaper == true) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('papertwo')
								.setLabel('Inspect Secret Note')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Back of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow]});
				} else {
					await i.reply({ content: 'You try to open the drawer but it seems stuck. Looks like you may need a key to open any of the drawer on this desk.', ephemeral: true });
				}
				break;
				
			case 'inventory':
				if(inventory.length == 0) { 
					await i.reply({ content: 'Your inventory is empty!', ephemeral: true });
				} else {
					const list = ['▪ Key', '▪ Flask 1', '▪ Flask 2', '▪ Flask 3', '▪ Jar', '▪ Acid'];
					
					await i.reply({ content: inventory.map((item) => list[item-1]).join('\n'), ephemeral: true });
				}
				break

			case 'usedmachine':
				if(checker(inventory, [2,3,4]) == true) {
					usedMachine = true;
					inventory = removeFromArray(inventory, 2);
					inventory = removeFromArray(inventory, 3);
					inventory = removeFromArray(inventory, 4);
					inventory.push(6);
					await i.reply({ content: 'You carefully place the three flasks inside the machine and the jar on the other side. The machine starts to take the contents inside the three flags and mixes them together. After a few minutes of mixing and heating, the new compound solution starts to pour inside the jar. After it is finished you grab the jar and inspect the contents only to find out you have created acid!', ephemeral: true });
				
					row.setComponents(
						new MessageButton()
							.setCustomId('behind')
							.setLabel('Look Behind')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();

					if(clutchPhase == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('doorchained')
								.setLabel('Inspect Door')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}
					else {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('doorchained')
								.setLabel('Inspect Door')
								.setStyle('DANGER')
								.setDisabled(false),
							new MessageButton()
								.setCustomId('flesh')
								.setLabel('Inspect Flesh')
								.setStyle('DANGER')
								.setDisabled(false),
						);
					}

					if(alcCabinet == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('alccabinet')
								.setLabel('Inspect Cabinet')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(usedMachine == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('usedmachine')
								.setLabel('Inspect Workstation')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Front of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription((clutchPhase == false ? '⠀\nYou stand towards the front of the cabin. Before you is a chained door and a alchemy workstation with a cabinet above it.\n⠀' : '⠀\nYou stand towards the front of the cabin. Before you is a unchained door with fleshy walls beside it. You feel uneasy by the image.\n⠀'))
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow] });

				} else {
					await i.reply({ content: 'You inspect the workstation only to figure out it\'s some sort of machine used for creating acid. There might be ingredients somewhere around the cabin. ', ephemeral: true });
				}
				break;

			case 'doorchained':
				if(clutchPhase == false) {
					if(inventory.includes(6)) {
						collector.resetTimer({ time: 120000 });
						clutchPhase = true;
						inventory = removeFromArray(inventory, 5);
						front = true;
						row.setComponents(
							new MessageButton()
								.setCustomId('behind')
								.setLabel('Look Behind')
								.setStyle('PRIMARY')
								.setDisabled(false),
							new MessageButton()
								.setCustomId('inventory')
								.setLabel('Inventory')
								.setStyle('PRIMARY')
								.setDisabled(false),
						);

						actionRow = new MessageActionRow();

						if(clutchPhase == false) {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('doorchained')
									.setLabel('Inspect Door')
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						}
						else {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('doorchained')
									.setLabel('Inspect Door')
									.setStyle('DANGER')
									.setDisabled(false),
								new MessageButton()
									.setCustomId('flesh')
									.setLabel('Inspect Flesh')
									.setStyle('DANGER')
									.setDisabled(false),
							);
						}

						if(alcCabinet == false) {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('alccabinet')
									.setLabel('Inspect Cabinet')
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						}

						if(usedMachine == false) {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('usedmachine')
									.setLabel('Inspect Machine')
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						}

						embed = new MessageEmbed()
							.setTitle('Viewing The Front of the Cabin')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription((clutchPhase == false ? '⠀\nYou stand towards the front of the cabin. Before you is a chained door and a alchemy workstation with a cabinet above it.\n⠀' : '⠀\nYou stand towards the front of the cabin. Before you is a unchained door with fleshy walls beside it. You feel uneasy by the image.\n⠀'))
							.setFooter('Click a button below!');

						await interactionMessage.edit({ embeds: [embed], components: [row, actionRow] });
						await i.reply({ content: 'You use the acid on the chains to the door and the chains immediately evaporate! Suddenly the walls start shaking and all of a sudden flesh starts binding through the Wood of the cabin walls. you should quickly exit the cabin.', ephemeral: true });
					} else {
						await i.reply({ content: 'The door is bounded with thick strong chains. You need to find a way to break those chains to get through to the door.', ephemeral: true });
					}
				} else {
					const nums = [0, 0, 0, 0, 0];
					let tempEmbed = new MessageEmbed()
						.setTitle('Crack the Code!')
						.setDescription('`' + nums.join('') + '`\n\nYou inspect the door only to find out that you cannot open it. There seems to be a keypad on the door that takes five numbers.');

					const numbers = [	new MessageActionRow().addComponents(new MessageButton().setCustomId('1').setLabel('1').setStyle('SECONDARY'), new MessageButton().setCustomId('2').setLabel('2').setStyle('SECONDARY'), new MessageButton().setCustomId('3').setLabel('3').setStyle('SECONDARY')),
						new MessageActionRow().addComponents(new MessageButton().setCustomId('4').setLabel('4').setStyle('SECONDARY'), new MessageButton().setCustomId('5').setLabel('5').setStyle('SECONDARY'), new MessageButton().setCustomId('6').setLabel('6').setStyle('SECONDARY')),
						new MessageActionRow().addComponents(new MessageButton().setCustomId('7').setLabel('7').setStyle('SECONDARY'), new MessageButton().setCustomId('8').setLabel('8').setStyle('SECONDARY'), new MessageButton().setCustomId('9').setLabel('9').setStyle('SECONDARY'), new MessageButton().setCustomId('0').setLabel('0').setStyle('SECONDARY'))];

					await i.reply({ embeds: [tempEmbed], components: [numbers[0], numbers[1], numbers[2]], ephemeral: true });

					const keypad = await i.fetchReply();
					// eslint-disable-next-line no-case-declarations

					const filter = j => {
						return j.message.id == keypad.id;
					};

					const key = keypad.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 5 });

					key.on('collect', async j => {
						nums[key.collected.size - 1] = Number(j.customId);
						if(key.collected.size != 5) {
							tempEmbed = new MessageEmbed()
								.setTitle('Crack the Code!')
								.setDescription('`' + nums.join('') + '`\n\nYou inspect the door only to find out that you cannot open it. There seems to be a keypad on the door that takes five numbers.');
							j.update({ embeds: [tempEmbed] });
						} else {
							// eslint-disable-next-line no-lonely-if
							if(String(nums.join('')) == '39124') {
								tempEmbed = new MessageEmbed()
									.setTitle('You cracked the code!')
									.setDescription('`' + nums.join('') + '`\n\nYou open the door and escaped!');
								j.update({ embeds: [tempEmbed] });
							} else {
								tempEmbed = new MessageEmbed()
									.setTitle('You failed to crack the code!')
									.setDescription('`' + nums.join('') + '`\n\nThe keypad beeps aggressively at you, looks like that was the wrong code.');
								j.update({ embeds: [tempEmbed], components: [] });
							}
						}
					});
					key.on('end', async () => {
						if(String(nums.join('')) == '39124') {
							win = true;
							embed = new MessageEmbed()
								.setTitle('You escaped!')
								// eslint-disable-next-line spaced-comment
								//.setThumbnail(user.defaultAvatarURL)
								.setDescription('⠀\nYou run far away from the cabin at speeds you were never able to muster before. Looking back in the distance you see a man holding a chainsaw and relief swims over your body as you were lucky to able to escape.⠀')
							await interactionMessage.edit({ embeds: [embed], components: []});
						}
					});

				}
				
				break;

			case 'alccabinet':
				if(inventory.includes(1)) {
					inventory.push(2);
					alcCabinet = true;
					await i.reply({ content: 'You unlock the cabinet to find a flask labeled one. you retrieved this item thinking you can use it later.', ephemeral: true });
				
					front = true;
					row.setComponents(
						new MessageButton()
							.setCustomId('behind')
							.setLabel('Look Behind')
							.setStyle('PRIMARY')
							.setDisabled(false),
						new MessageButton()
							.setCustomId('inventory')
							.setLabel('Inventory')
							.setStyle('PRIMARY')
							.setDisabled(false),
					);

					actionRow = new MessageActionRow();

					if(clutchPhase == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('doorchained')
								.setLabel('Inspect Door')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					} else {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('doorchained')
								.setLabel('Inspect Door')
								.setStyle('DANGER')
								.setDisabled(false),
							new MessageButton()
								.setCustomId('flesh')
								.setLabel('Inspect Flesh')
								.setStyle('DANGER')
								.setDisabled(false),
						);
					}

					if(alcCabinet == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('alccabinet')
								.setLabel('Inspect Cabinet')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					if(usedMachine == false) {
						actionRow.addComponents(
							new MessageButton()
								.setCustomId('usedmachine')
								.setLabel('Inspect Machine')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);
					}

					embed = new MessageEmbed()
						.setTitle('Viewing The Front of the Cabin')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription((clutchPhase == false ? '⠀\nYou stand towards the front of the cabin. Before you is a chained door and a alchemy workstation with a cabinet above it.\n⠀' : '⠀\nYou stand towards the front of the cabin. Before you is a unchained door with fleshy walls beside it. You feel uneasy by the image.\n⠀'))
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: [row, actionRow] });
				} else {
					await i.reply({ content: 'You tried to open the cabinet above the workstation but appears to be stuck. Maybe a key might open it.', ephemeral: true });
				}
				break;
				
			case 'paperone':
				await i.reply({ content: 'https://cdn.discordapp.com/attachments/932125060783816715/932837699537235989/paperone.png', ephemeral: true });
				break;
				
			case 'papertwo':
				await i.reply({ content: 'https://cdn.discordapp.com/attachments/932125060783816715/932838033164763147/papertwo.png', ephemeral: true });
				break;
				
			case 'flesh':
				await i.reply({ content: 'You try to touch the flesh and it burns your skin. You wonder why that was a good idea..', ephemeral: true });
				break;

			case 'safe':
				// eslint-disable-next-line no-case-declarations
				const nums = [0, 0, 0, 0];
				let tempEmbed = new MessageEmbed()
					.setTitle('Crack the Code!')
					.setDescription('`' + nums[0] + nums[1] + nums[2] + nums[3] + '`\n\nYou inspect the safe and find a keypad on it, enter the four correct digits to open the safe.');

				const numbers = [	new MessageActionRow().addComponents(new MessageButton().setCustomId('1').setLabel('1').setStyle('SECONDARY'), new MessageButton().setCustomId('2').setLabel('2').setStyle('SECONDARY'), new MessageButton().setCustomId('3').setLabel('3').setStyle('SECONDARY')),
					new MessageActionRow().addComponents(new MessageButton().setCustomId('4').setLabel('4').setStyle('SECONDARY'), new MessageButton().setCustomId('5').setLabel('5').setStyle('SECONDARY'), new MessageButton().setCustomId('6').setLabel('6').setStyle('SECONDARY')),
					new MessageActionRow().addComponents(new MessageButton().setCustomId('7').setLabel('7').setStyle('SECONDARY'), new MessageButton().setCustomId('8').setLabel('8').setStyle('SECONDARY'), new MessageButton().setCustomId('9').setLabel('9').setStyle('SECONDARY'), new MessageButton().setCustomId('0').setLabel('0').setStyle('SECONDARY'))];

				await i.reply({ embeds: [tempEmbed], components: [numbers[0], numbers[1], numbers[2]], ephemeral: true });

				const keypad = await i.fetchReply();
				// eslint-disable-next-line no-case-declarations

				const filter = j => {
					return j.message.id == keypad.id;
				};

				const key = keypad.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 4 });

				key.on('collect', async j => {
					nums[key.collected.size - 1] = Number(j.customId);
					if(key.collected.size != 4) {
						tempEmbed = new MessageEmbed()
							.setTitle('Crack the Code!')
							.setDescription('`' + nums.join('') + '`\n\nYou inspect the safe and find a keypad on it, enter the four correct digits to open the safe.');
						j.update({ embeds: [tempEmbed] });
					} else {
						// eslint-disable-next-line no-lonely-if
						if(String(nums.join('')) == '6271') {
							tempEmbed = new MessageEmbed()
								.setTitle('You cracked the code!')
								.setDescription('`' + nums.join('') + '`\n\nYou open the safe to collect a key and a flask labeled 3.');
							j.update({ embeds: [tempEmbed] });
						} else {
							tempEmbed = new MessageEmbed()
								.setTitle('You failed to crack the code!')
								.setDescription('`' + nums.join('') + '`\n\nLooks like that wasn\'t the right passcode and you couldn\'t open the safe you should look around for a clue and try again.');
							j.update({ embeds: [tempEmbed], components: [] });
						}
					}
				});

				key.on('end', async () => {
					if(String(nums.join('')) == '6271') {
						inventory.push(1);
						inventory.push(4);
						safe = true;

						front = false;
						row.setComponents(
							new MessageButton()
								.setCustomId('front')
								.setLabel('Look Infront')
								.setStyle('PRIMARY')
								.setDisabled(false),
							new MessageButton()
								.setCustomId('inventory')
								.setLabel('Inventory')
								.setStyle('PRIMARY')
								.setDisabled(false),
						);

						actionRow = new MessageActionRow();
						shelfRow = new MessageActionRow();

						for(let x = 0; x < shelves.length; x++) {
							const shelf_names = ['Bottom Left Shelf', 'Top Left Shelf', 'Top Right Shelf', 'Bottom Right Shelf'];
							if(shelves[x] == false) {
								shelfRow.addComponents(
									new MessageButton()
										.setCustomId('shelf' + x)
										.setLabel('Inspect ' + shelf_names[x])
										.setStyle('SECONDARY')
										.setDisabled(false),
								);
							} else {
								shelfRow.addComponents(
									new MessageButton()
										.setCustomId('shelf' + x)
										.setLabel('Inspect ' + shelf_names[x])
										.setStyle('SECONDARY')
										.setDisabled(true),
								);
							}
						}

						actionRow.addComponents(
							new MessageButton()
								.setCustomId('paperone')
								.setLabel('Inspect Note')
								.setStyle('SECONDARY')
								.setDisabled(false),
						);

						if(safe == false) {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('safe')
									.setLabel('Inspect Safe')
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						}

						if(secondPaper == true) {
							actionRow.addComponents(
								new MessageButton()
									.setCustomId('papertwo')
									.setLabel('Inspect Secret Note')
									.setStyle('SECONDARY')
									.setDisabled(false),
							);
						}

						embed = new MessageEmbed()
							.setTitle('Viewing The Back of the Cabin')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\nYou stand towards the back of the cabin. Before you is a desk with two drawers on each side, a piece of paper on top and a small safe on a tall table.\n⠀')
							.setFooter('Click a button below!');

						await interactionMessage.edit({ embeds: [embed], components: [row, actionRow, shelfRow]});
					}
				});

				break;
			}
		});

		collector.on('end', async () => {
			if(win == false) {
				if(clutchPhase == false) {
					embed = new MessageEmbed()
						.setTitle('You failed to escape!')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nA mysterious figure appears before you with a chainsaw. The rest is history\n⠀')
						.setFooter('Click a button below!');

					await interactionMessage.edit({ embeds: [embed], components: []});
				} else {
					embed = new MessageEmbed()
						.setTitle('You failed to escape!')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nThe flesh starts to swallow you as your skin starts to merge with the cells inside the flesh. To this day, you are still alive.. but as the cabin itself.\n⠀')
						.setFooter('Click a button below!');
					await interactionMessage.edit({ embeds: [embed], components: []});
				}
			}
		});
	},
};