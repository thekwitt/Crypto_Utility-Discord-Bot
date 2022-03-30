const { Perms } = require('../validations/Permissions');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const Ascii = require('ascii-table');

/**
 * @param {Client} client
 */

module.exports = async (client) => {
	const Table = new Ascii('Commands Loaded');

	(await PG(process.cwd() + '/bot_modules/commands/*/*.js')).map (async (file) => {
		const command = require(file);

		if(!command.name) return Table.addRow(file.split('/')[7], '🔸 FAILED', 'Missing a name.');

		if(command.permission) {
			if(Perms.includes(command.permission)) command.defaultPermission = false;
			else return Table.addRow(file.split('/')[7], '🔸 FAILED', 'Permission is invalid');
		}

		client.commands.set(command.name, command);

		await Table.addRow(command.name, '🔹 SUCCESSFUL');
	});

	client.extra.simple_log(client.logger, Table.toString());
	client.ready[1] = true;
};
