module.exports = function(options, {scriptName, run}) {
	let { __, cron, log, config, mongo, getMinio } = options;

	let prefix = `RUN.${scriptName}`
	let schedule = config.DEBUG ? '*/10 * * * * *' : '*/5 * * * *'

	cron.schedule(schedule, () => {
		run(scriptName, deleteImages)
	});

	async function deleteImages() {
		var [err, images] = await __.to(mongo.Image.find({ deleted: true }).exec())

		if(err) return log.error(prefix, 'mongo.select.err', err.message)

		log.info(prefix, 'images_to_delete', images.length)
		await __.asyncForEach(images, async (image) => {
			log.debug('deleting', image._id)

			let domain = await mongo.Domain.findOne({ domain: image.domain }).exec()
			if(!domain || !domain.s3.endPoint) {
				log.error(prefix, 'no_domain', 'domain: '+ !!domain, 'domain.s3.endPoint: '+ !!domain.s3.endPoint);
				return;
			}

			let minio = getMinio(domain.s3)

			await __.asyncForEach(image.refChildren, async (img) => {
				var [err] = await __.to( minio.removeObject(domain.s3.bucket, `${image.s3_folder}/${img.s3_file}`) )
				if(err) log.error(prefix, 'minio.refChildren.err', err.message)
				return;
			})

			var [err] = await __.to( minio.removeObject(domain.s3.bucket, `${image.s3_folder}/${image.reference.s3_file}`) )
			if(err) {
				log.error(prefix, 'minio.reference.err', err.message)
				return;
			}

			var [err] = await __.to( minio.removeObject(domain.s3.bucket, `${image.s3_folder}/${image.original.s3_file}`) )
			if(err) {
				log.error(prefix, 'minio.original.err', err.message)
				return;
			}
			

			var [err, result] = await __.to( mongo.Image.deleteOne({
				_id: image._id
			}) )
			if(err) {
				log.error(prefix, 'mongo.delete.err', err.message)
				return;
			}
			log.debug('deleted', image._id)
		})
	}
};
