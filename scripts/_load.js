module.exports = async function(options) {
	let { __, _, log, initStats } = options;

	var stats = initStats

	async function run(scriptName, fn) {
		if(!stats[scriptName]) 
			stats[scriptName] = {
				lastRun: {},
				runs: []
			}

		let runStats = {}

		let prefix = `RUN.${scriptName}`
		log.info(prefix, 'start');

		runStats.tsStart = new Date().getTime()/1000
		try {
			await fn()
		} catch(e) {
			runStats.error = e.message
		}
		runStats.tsFinish = new Date().getTime()/1000
		runStats.duration = +(runStats.tsFinish - runStats.tsStart).toFixed(1)

		stats[scriptName].lastRun = runStats
		stats[scriptName].runs.fixedPush(runStats, 10)

		log.info(prefix, 'finished', `+${runStats.duration} seconds`);
	}

	//load modules dynamicaly
	let modules = __.modulesAt(__.path('scripts/'), {
		camelCase: false,
		capitalize: false,
	});

	_.each(modules, module => {
		if (module.name == '_load') return;

		log.info('scripts.loaded', module.name)
		require(module.path)(options, {scriptName: module.name, run})
	});

	return stats
};
