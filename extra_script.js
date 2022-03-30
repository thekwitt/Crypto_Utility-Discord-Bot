const fetch = require('node-fetch');
const { os_apikey, ether_apikey } = require('./token.json');
const { makeCollageSeparate } = require('./bot_modules/extras/collage.js');
const { registerFont, createCanvas, loadImage } = require('canvas');
const { MessageEmbed } = require('discord.js');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getTime(time, mode) {

	time = Math.floor(time / 1000) + 1;

	if(mode == 1) return time % 60;
	else if (mode == 2) return Math.floor(time / 60) % 60;
	else if (mode == 3) return Math.floor(time / 3600);
}

async function deleteMessageAfterTime(client, message, time)
{
	setTimeout(async () => {

		if(message == undefined) return;

		if(message.channel == undefined) return;

		if (message.deleted === false)
		{
			try { await message.delete(); }
			catch { return; }
		}
	}, time);
}

function makeSkullxSaleEmbed(img, url, price, name, listing, spender) {
	const embed = new MessageEmbed()
		.setTitle(name + ' sold for ' + price + '!')
		.setColor('FFFFFF')
		.setAuthor(spender + ' sniped this!')
		.setURL(url)
		.setImage(img)
		.setFooter({ text: 'This was sold on ' + listing });

	return embed;
}

async function getJsonEther(url) {
	let fuck = undefined;

	const options = { method: 'GET' };

	fuck = await fetch(url + '&apikey=' + ether_apikey, options)
		.then(response => response.json())
		.catch(err => console.error(err));

	return fuck;
}

async function getJsonOS(url) {
	let fuck = undefined;

	const options = { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-API-KEY': os_apikey } };

	fuck = await fetch(url, options)
		.then(response => response.json())
		.catch(err => console.error(err));

	return fuck;
}

async function loadImages(assets) {
	const list = [];

	for(let i = 0; i < assets.length; i++) {
		list.push(await loadImage(assets[i].image_url));
	}

	return list;
}

async function callAllWallets(str, con) {
	const wallets = str.split(',');

	let contracts = undefined;

	if(!Array.isArray(con)) contracts = [con];
	else contracts = con;

	let assets = [];

	for(let x = 0; x < wallets.length; x++) {
		for(let y = 0; y < contracts.length; y++) {
			try { assets = assets.concat(await getOwnerAssetsContract(wallets[x], contracts[y])); }
			catch {
				try { assets = assets.concat(await getOwnerAssetsSlug(wallets[x], contracts[y])); }
				catch{;}
			}
		}
	}

	return assets;
}

async function getNFTs(client, collections) {
	const assets = [];

	for(const collection of collections) {
		const temps = collection.toLowerCase().split(',');

		const c = temps[0];
		const n = temps.slice(1);

		n.forEach(function(part, index, theArray) { theArray[index] = 'token_ids=' + part; });

		const string = n.join('&');

		const data = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?order_direction=desc&' + string + '&limit=50&collection=' + c);

		const collected = data.assets;

		assets.push(collected);
	}
	return assets;
}

async function assetBridger(owners, contracts) {
	const cons = contracts.split(',');

	let assets = [];

	for(let x = 0; x < cons.length; x++) {
		try { assets = assets.concat(await callAllWallets(owners, contracts[x])); }
		catch {;}
	}

	return assets;
}

let checker = (arr, target) => target.every(v => arr.includes(v));

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function price_calc(num) {
	return num / 1000000000000000000;
}

function usd_calc(num, eth) {
	return (num * eth).toFixed(2);
}

async function getBasicAssets(client, id, source) {
	let assets = undefined;
	try {
		assets = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?order_direction=desc&token_ids=' + id + '&limit=1&asset_contract_address=' + source);
		if(assets.asset_contract_address[0].startsWith('Address like string')) assets = await client.extra.getJsonOS('https://api.opensea.io/api/v1/assets?order_direction=desc&token_ids=' + id + '&limit=1&collection=' + source);
	} catch {;}
	return assets;
}

async function getBasicBundle(client, id, source) {
	let bundle = undefined;
	try {
		bundle = await client.extra.getJsonOS('https://api.opensea.io/api/v1/bundle?order_direction=desc&token_ids=' + id + '&limit=1&asset_contract_address=' + source);
		if(bundle.success == false || bundle.asset_contract_address[0].startsWith('Address like string')) bundle = await client.extra.getJsonOS('https://api.opensea.io/api/v1/bundle?order_direction=desc&token_ids=' + id + '&limit=1&collection=' + source);
	} catch {;}
	return bundle;
}

async function ens2eth(client, address) {
	try{
		return await client.ens.getAddress(address);
	} catch {
		return address;
	}
}

async function getOwnerAssetsContract(owner, contract) {
	let list = [];
	let x = 0;
	while(true) {
		const data = await getJsonOS('https://api.opensea.io/api/v1/assets?offset=' + x + '&owner=' + owner + '&asset_contract_address=' + contract + '');
		const assets = data.assets;
		list = [...list, ...assets];
		if(assets.length != 20) break;
		x += 20;
	}
	return list;
}

async function getOwnerAssetsSlug(owner, slug) {
	let list = [];
	let x = 0;
	while(true) {
		const data = await getJsonOS('https://api.opensea.io/api/v1/assets?offset=' + x + '&owner=' + owner + '&collection=' + slug);
		const assets = data.assets;
		list = [...list, ...assets];
		if(assets.length != 20) break;
		x += 20;

	}
	return list;

}

// eslint-disable-next-line no-unused-vars

function nFormatter(num, digits) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'B' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	// eslint-disable-next-line no-shadow
	const item = lookup.slice().reverse().find(function(item) {
		return num >= item.value;
	});
	return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

function zfill(number, digits) {
	if (number > 0) {
		return number.toString().padStart(digits, '0');
	} else {
		return '-' + Math.abs(number).toString().padStart(digits, '0');
	}
}

function sortFunction(a, b) {
	if (a[1] === b[1]) {
		return 0;
	}
	else {
		return (a[1] > b[1]) ? -1 : 1;
	}
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}
	return array;
}

function removeFromArray(array, element) {
	const index = array.indexOf(element);
	if (index > -1) {
		return array.splice(index, 1);
	}
}

function maxY(imgs, columns) {
	const ys = new Array(columns).fill(0);

	for(let i = 0; i < imgs.length; i++) {
		const ind = indexOfMinimum(ys);

		const ratio = imgs[i].height / imgs[i].width;
		const h = 250 * ratio;

		ys[ind] += h;
	}

	return Math.max(...ys);
}

function getID(asset) {
	let id = asset.token_id;
	try {
		if(Number(asset.token_id) > 100000) {
			const temp = asset.name.split('#');
			id = temp[temp.length - 1];
		}
	} catch {return id;}
	return id;
}

function indexOfMinimum(array) {
	const min = Math.min(...array);
	return array.indexOf(min);
}

async function makeCollage2(collections, columns, exclude_id) {
	return await makeCollageSeparate(collections, columns, exclude_id);
}

async function makeCollage(assets, columns, exclude) {
	const imgs = await loadImages(assets);
	const y = maxY(imgs, columns);

	const ys = new Array(columns).fill(0);

	const w = 250;

	let x = w * columns;
	if(assets.length < columns) x = assets.length * w;

	const canvas = createCanvas(x, y);
	const context = canvas.getContext('2d');

	registerFont('./Rank.ttf', { family: 'ranks' });

	for(let j = 0; j < assets.length; j++) {

		const ratio = imgs[j].height / imgs[j].width;
		const h = w * ratio;

		const ind = indexOfMinimum(ys);

		context.drawImage(imgs[j], (ind) * w, ys[ind], w, h);

		ys[ind] += h;

		if(exclude != true) {
			const id = getID(assets[j]);
			if(id != undefined) {
				context.fillStyle = '#000000';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 40), (ys[ind] - h) + Math.floor(h / 11));
				context.fillStyle = '#EDEDED';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 55), (ys[ind] - h) + Math.floor(h / 12));
			}
		}
	}

	return canvas.toBuffer();
}

async function rarityCalculate(asset, client, collection) {
	const stats = await client.extra.getJsonOS('https://api.opensea.io/api/v1/collection/' + collection + '/stats');
	const traits = asset.traits;

	const returns = [];

	// Traits
	for(const trait of traits) {
		const percent = trait.trait_count / stats.stats.total_supply;

		returns.push(1 / percent);
	}

	return returns.reduce((partialSum, a) => partialSum + a, 0);
}

async function makeCollageColumnPrices(assets, columns, exclude) {
	const imgs = await loadImages(assets);
	const y = maxY(imgs, columns);

	const ys = new Array(columns).fill(0);

	const w = 250;

	let x = w * columns;
	if(assets.length < columns) x = assets.length * w;

	const canvas = createCanvas(x, y);
	const context = canvas.getContext('2d');

	registerFont('./Rank.ttf', { family: 'ranks' });

	for(let j = 0; j < assets.length; j++) {

		const ratio = imgs[j].height / imgs[j].width;
		const h = w * ratio;

		const ind = indexOfMinimum(ys);

		context.drawImage(imgs[j], (ind) * w, ys[ind], w, h);

		ys[ind] += h;

		if(exclude != true) {
			const id = getID(assets[j]);
			if(id != undefined) {
				context.fillStyle = '#000000';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 40), (ys[ind] - h) + Math.floor(h / 11));
				context.fillStyle = '#EDEDED';
				context.font = Math.floor(h / 11) + 'px "ranks"';
				context.fillText('#' + id, (ind) * w + Math.floor(h / 55), (ys[ind] - h) + Math.floor(h / 12));
			}
		}
	}

	return canvas.toBuffer();
}


function simple_log(logger, message) {
	logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + message + '\n');
}

function log(logger, guild, message) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_error(logger, guild, message) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | 🔸 ERROR ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_g(logger, guild, message, group) {
	try{
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + group + ': ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_error_g(logger, guild, message, group) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | 🔸 ERROR ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + group + ': ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function getDB() {
	return require('./db.json');
}

function setDB(json) {
	const fs = require('fs');
	const data = JSON.stringify(json);
	return fs.writeFile('./db.json', data, (err) => {
		if (err) {
			throw err;
		}
	});
}

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const getRandom = (items) => items[Math.floor(Math.random() * items.length)];

module.exports = { getNFTs, makeCollage2, rarityCalculate, getTime, getJsonEther, ens2eth, callAllWallets, getBasicAssets, getBasicBundle, makeCollage, getJsonOS, checker, loadImages, usd_calc, assetBridger, capitalizeFirstLetter, price_calc, removeFromArray, getDB, setDB, log, log_error, log_g, log_error_g, simple_log, nFormatter, getRandom, shuffle, random, sleep, zfill, sortFunction, deleteMessageAfterTime };