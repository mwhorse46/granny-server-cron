module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, minio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/30 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, deleteImages)
	});

	async function deleteImages() {
		let currentTS = parseInt(new Date().getTime()/1000)

		var [err, images] = await __.to(mongo.Image.aggregate([
			{
				$unwind: {
					path: "$refChildren",
					includeArrayIndex: "arrayIndex"
				}
			},
			{
				$match: { 
					"refChildren.ttl": { 
						$lt: currentTS 
					}
				}
			}
		]).exec())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)

		log.info(prefix, 'images_to_delete', images.length)
		await __.asyncForEach(images, async (image) => {
			var [err] = await __.to( minio.removeObject(image.domain, `${image.s3_folder}/${image.refChildren.s3_file}`) )
			if(err) return log.error(prefix, 'minio.err', err.message)

			var [err, result] = await __.to( mongo.Image.updateOne({
				_id: image._id
			},{
				$pull: {
					refChildren: {
						_id: image.refChildren._id
					}
				}
			}) )
			if(err) return log.error(prefix, 'mongo.delete.err', err.message)
		})
	}
};
