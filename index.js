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
		MONGO: process.env.MONGO || 'mongodb://localhost/js_cdn'
	};

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
	function getMinio({endPoint, accessKey, secretKey, port = false, useSSL = true}) {
		return new Minio.Client({endPoint, accessKey, secretKey, port, useSSL})
	}

	/* Mongo */
	const mongo = await require(__.path('granny-server-backend/src/mongo/_load'))(initModules);

	let dataFile = __.path('data/stats.json')
	let initStats =  await getState(dataFile)

	_.assign(initModules, { mongo, getMinio, initStats });

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