module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, minio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/30 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, deleteImages)
	});

	async function deleteImages() {
		let currentTS = parseInt(new Date().getTime()/1000)

		var [err, images] = await __.to(mongo.Image.find({ deleted: true }).exec())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)

		log.info(prefix, 'images_to_delete', images.length)
		await __.asyncForEach(images, async (image) => {
			log.debug('deleting', image._id)

			await __.asyncForEach(image.refChildren, async (img) => {
				var [err] = await __.to( minio.removeObject(image.domain, `${image.s3_folder}/${img.s3_file}`) )
				if(err) return log.error(prefix, 'minio.refChildren.err', err.message)
			})

			var [err] = await __.to( minio.removeObject(image.domain, `${image.s3_folder}/${image.reference.s3_file}`) )
			if(err) return log.error(prefix, 'minio.reference.err', err.message)

			var [err] = await __.to( minio.removeObject(image.domain, `${image.s3_folder}/${image.original.s3_file}`) )
			if(err) return log.error(prefix, 'minio.original.err', err.message)
			

			var [err, result] = await __.to( mongo.Image.deleteOne({
				_id: image._id
			}) )
			if(err) return log.error(prefix, 'mongo.delete.err', err.message)
		})
	}
};
