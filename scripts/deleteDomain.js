module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, getMinio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/10 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, deleteDomain)
	});

	async function deleteDomain() {
		var [err, domains] = await __.to(mongo.Domain.find({ deleted: true }).exec())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)

		log.info(prefix, 'domains_to_delete', domains.length)

		await __.asyncForEach(domains, async (domain) => {
			log.debug('deleting', domain.domain)

			var [err, images] = await __.to(mongo.Image.find({ domain: domain.domain }).exec())
			if(images.length) {
				log.warn('cant_delete_domain', 'still have images to delete: '+ images.length)

				var [err, updated] = await __.to(mongo.Image.updateMany({ 
					domain: domain.domain 
				}, {
					deleted: true
				}).exec())

				return;
			}

			var [err, result] = await __.to( mongo.Domain.deleteOne({
				_id: domain._id
			}) )
			if(err) {
				log.error(prefix, 'mongo.delete.err', err.message)
				return;
			}
			log.debug('deleted', domain.domain)
		})
		
		
	}
};
