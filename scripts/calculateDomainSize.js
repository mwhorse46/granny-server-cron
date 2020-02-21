module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, getMinio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/10 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, calculate)
	});

	async function calculate() {
		var [err, domains] = await __.to(mongo.Domain.find())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)
		log.info(prefix, 'domains', domains.length)

		await __.asyncForEach(domains, async (domain) => {
			return new Promise((resolve) => {
				let minio = getMinio(domain.s3)

				let totalSize = 0
				let stream = minio.listObjectsV2(domain.s3.bucket, '', true)
				stream.on('data', (obj) => {
					if(obj.size && typeof obj.size == 'number') totalSize += obj.size
				})
				stream.on('end', async () => {
					log.debug(prefix, domain.domain, 'size: '+ totalSize)

					var [err, result] = await __.to( mongo.Domain.updateOne({
						domain: { $eq: domain.domain } 
					},{
						size: totalSize
					}) )
					if(err) return log.error(prefix, 'mongo.update.err', err.message)

					return resolve()
				})
				stream.on('error', (err) => { 
					log.error(prefix, domain.domain, 'stream.err', err.message)
					return resolve()
				})
			})
		})
	}
};
