const { registerFont, createCanvas, loadImage } = require('canvas');

function maxY(col_imgs, columns) {
	let yMax = 0;

	for(let j = 0; j < col_imgs.length; j++) {
		const ys = new Array(columns).fill(0);
		const imgs = col_imgs[j];
		for(let i = 0; i < imgs.length; i++) {
			const ind = i % columns;

			const ratio = imgs[i].height / imgs[i].width;
			const h = 250 * ratio;

			ys[ind] += h;
		}

		yMax += Math.max(...ys);
	}

	return yMax;
}

async function loadImages(assets) {
	const list = [];

	for(let i = 0; i < assets.length; i++) {
		list.push(await loadImage(assets[i].image_url));
	}

	return list;
}

function getCount(collections) {
	let x = 0;

	collections.forEach(c => x += c.length);

	return x;
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

async function makeCollageSeparate(collections, c, exclude_id) {
	let columns = c;
	const col_imgs = [];

	for(const collection of collections) {
		col_imgs.push(await loadImages(collection));
	}

	const y = maxY(col_imgs, columns);

	const w = 250;

	const xCheck = getCount(collections);

	if(xCheck < columns) {
		columns = xCheck - 1;
	}

	const x = w * columns;

	let ys = new Array(columns).fill(0);

	const canvas = createCanvas(x, y);
	const context = canvas.getContext('2d');

	registerFont('./Rank.ttf', { family: 'ranks' });

	for(let j = 0; j < col_imgs.length; j++) {
		const imgs = col_imgs[j];
		for(let i = 0; i < imgs.length; i++) {
			const ratio = imgs[i].height / imgs[i].width;
			const h = w * ratio;

			const ind = i % columns;

			context.drawImage(imgs[i], (ind) * w, ys[ind], w, h);

			ys[ind] += h;

			const id = getID(collections[j][i]);
			if(exclude_id == true) {
				if(id != undefined) {
					// IDs
					context.fillStyle = '#000000';
					context.font = Math.floor(h / 11) + 'px "ranks"';
					context.fillText('#' + id, (ind) * w + Math.floor(h / 40), (ys[ind] - h) + Math.floor(h / 11));
					context.fillStyle = '#EDEDED';
					context.font = Math.floor(h / 11) + 'px "ranks"';
					context.fillText('#' + id, (ind) * w + Math.floor(h / 55), (ys[ind] - h) + Math.floor(h / 12));
				}
			}
		}

		ys = new Array(x).fill(Math.max(...ys));
	}

	return canvas.toBuffer();
}

module.exports = { makeCollageSeparate };