module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.ready[0] = true;

		// Add something here later

		client.extra.simple_log(client.logger, 'Bot is ready');
	},
};