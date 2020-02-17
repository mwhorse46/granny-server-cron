module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, minio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/10 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, calculate)
	});

	calculate()
	async function calculate() {
		var [err, domains] = await __.to(mongo.Image.aggregate([
			{
				$unwind: {
					path: "$refChildren",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: "$domain",
					originalSize: {
						$sum: "$original.size"
					},
					refSize: {
						$sum: "$reference.size"
					},
					refChildrenSize: {
						$sum: {$sum: "$refChildren.size"}
					}
				}
			}
		]).exec())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)
		log.info(prefix, 'domains_with_images', domains.length)

		await __.asyncForEach(domains, async (domain) => {
			let totalSize = domain.originalSize + domain.refSize + domain.refChildrenSize

			var [err, result] = await __.to( mongo.Domain.updateOne({
				domain: { $eq: domain._id } 
			},{
				size: totalSize
			}) )
			if(err) return log.error(prefix, 'mongo.update.err', err.message)
		})
	}
};
