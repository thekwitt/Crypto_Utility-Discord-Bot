/* eslint-disable max-statements-per-line */
const fs = require('fs');

const { Client, Collection, Intents } = require('discord.js');
const { token, eth_endpoint, ws_endpoint } = require('./token.json');
const extra = require('./extra_script');
const Web3 = require('web3');
const web3 = new Web3(eth_endpoint);
const web3ws = new Web3(ws_endpoint);
const ens = web3.eth.ens;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.bosses = [];
client.crayola = require('./crayola.json');
client.colors = ['#E81224', '#F7630C', '#FFF100', '#16C60C'];
client.web3 = web3;
client.ens = ens;
client.logger = fs.createWriteStream('./logs/' + Date.now() + '.txt', { flags : 'w' });
client.commands = new Collection();
client.ready = [false, false];
client.extra = extra;
client.sweep = 0;
client.addresses = [];

['Commands'].forEach(handler => {
	require('./bot_modules/handlers/' + handler)(client, token);
});


// Events
fs.readdirSync('./bot_modules/events/').forEach((dir) => {
	const eventFiles = fs
		.readdirSync(`./bot_modules/events/${dir}/`)
		.filter((file) => file.endsWith('.js'));
	eventFiles.forEach(async (file) => {
		client.extra.simple_log(client.logger, file + ' loading.');
		const event = require(`./bot_modules/events/${dir}/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
		client.extra.simple_log(client.logger, file + ' loaded.');
	});
});

// bosses
fs.readdirSync('./bot_modules/bosses/').forEach((file) => {
	client.bosses.push(require('./bot_modules/bosses/' + file));
});
/*
// Commands
fs.readdirSync('./bot_modules/commands/').forEach((dir) => {
	const commandFiles = fs
		.readdirSync(`./bot_modules/commands/${dir}/`)
		.filter((file) => file.endsWith('.js'));
	commandFiles.forEach(async (file) => {
		const command = require(`./bot_modules/commands/${dir}/${file}`);
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
	});
});
*/

const options = {
};


const subscription = web3ws.eth.subscribe('logs', options, function(error, result) {
	if (error) console.log(error);
}).on('data', async function(log) {
	client.addresses.push({ createdAt: Date.now(), value: log.address });
});


const abi_ = require('./abi.json');

const contract = new web3.eth.Contract(abi_, '0x1dc5d3b2162f9500d7ddec14eb0ba9ccb43bc20c');
contract.getPastEvents('allEvents', {
	fromBlock: 14382855,
	toBlock: 'latest',
}, async function(error, events) {
	if(!error) {
		for(let i = 0; i < events.length;i++) {
			if(events[i].transactionHash === '0x1166e738588730536b5d3f37658427ece16a26740ea019bde1013b93ba77d2f9')
			{
				const token = events[i].returnValues.tokenId;

				const transaction = await web3.eth.getTransaction(events[i].transactionHash);
				const receipt = await web3.eth.getTransactionReceipt(events[i].transactionHash);

				const price = '';
				const listing = '';
				console.log('');
			}
		}
	}
});


async function status() {
	if(client.ready.every(v => v === true))
	{
		const firstPart = client.extra.nFormatter(client.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0)).toString() + ' degens ';

		try{ await client.user.setActivity(firstPart + ' burning heralds.', { type: 'WATCHING' }); } catch {console.error;}
	}
}

setInterval(function checkItems() {
	client.addresses.forEach(function(address) {
		if(Date.now() - 300000 > address.createdAt) {
			client.addresses.shift();
		}
	});
}, 10000);
setInterval(async function() {status();}, 3600000);

client.login(token);