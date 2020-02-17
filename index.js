;(async () => {

	const __ = require('./utils/utils');
	require(__.path('utils/prototypes'))

	const _ = require('lodash');
	const cron = require('node-cron');
	const moment = require('moment');
	moment.locale('ru');
	const fs = require('fs').promises;

	/* Config from env */
	const config = {
		DEBUG: process.env.DEBUG || false,
		MONGO: process.env.MONGO || 'mongodb://localhost/js_cdn',

		S3_HOST: process.env.S3_HOST || '127.0.0.1',
		S3_PORT: process.env.S3_PORT || 9000,
	};

	if (process.env.S3_ACCESS_KEY) config.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
	else if (process.env.S3_ACCESS_KEY_FILE)
		config.S3_ACCESS_KEY = (await fs.readFile('/run/secrets/' + process.env.S3_ACCESS_KEY_FILE)).toString();
	else config.S3_ACCESS_KEY = 'minioadmin';

	if (process.env.S3_ACCESS_SECRET) config.S3_ACCESS_SECRET = process.env.S3_ACCESS_SECRET;
	else if (process.env.S3_ACCESS_SECRET_FILE)
		config.S3_ACCESS_SECRET = (
			await fs.readFile('/run/secrets/' + process.env.S3_ACCESS_SECRET_FILE)
		).toString();
	else config.S3_ACCESS_SECRET = 'minioadmin';

	/* Logger */
	const log = require(__.path('utils/log'))({
		prefix: '#CRON |',
		level: config.DEBUG ? 'debug' : 'info',
	});
	log.info('START CONST', config);

	/* Initial modules pool */
	const initModules = { __, _, log, moment, config, cron };

	/* Minio server */
	const Minio = require('minio');

	const minio = new Minio.Client({
		endPoint: config.S3_HOST,
		port: config.S3_PORT,
		useSSL: false,
		accessKey: config.S3_ACCESS_KEY,
		secretKey: config.S3_ACCESS_SECRET,
	});

	/* Mongo */
	const mongo = await require(__.path('granny-server-backend/src/mongo/_load'))(initModules);

	let dataFile = __.path('data/stats.js')
	let initStats =  await getState(dataFile)

	_.assign(initModules, { mongo, minio, initStats });

	/* Script modules */
	let stats = await require(__.path('scripts/_load'))(initModules);

	setInterval(async () => {
		await saveState(dataFile, stats)
	}, 10000)

	async function getState(dataFile) {
		try {
			let data = await fs.readFile(dataFile)
			return JSON.parse(data)
		} catch(ex) {
			console.log('getState.ex', ex.message)
			return {}
		}
	}

	async function saveState(dataFile, state) {
		await fs.writeFile(dataFile, JSON.stringify(state))
	}
})()