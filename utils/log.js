const moment = require('moment')

function log(options) {
	this.options = Object.assign({}, {
		prefix: false,
		level: 'info',
		dateformat: 'DD.MM | HH:mm:ss |'
	}, options)

	const LEVEL_HIERARCHY = {
		debug: 10,
		info: 20,
		warn: 30,
		error: 40
	}
	this._checkLevel = function(level) {
		return LEVEL_HIERARCHY[level] >= LEVEL_HIERARCHY[this.options.level]
	}
	this._ts = function() {
		return moment().format(this.options.dateformat)
	}

	if(!LEVEL_HIERARCHY[this.options.level]) throw new Error('level does not supported')


	this.debug = function() {
		if(!this._checkLevel('debug')) return;

		let args = Array.from(arguments)
		
		let prefixes = [this._ts(), 'DEBUG |']
		if(this.options.prefix) prefixes.push(this.options.prefix)
		args.unshift(...prefixes)

		console.debug.apply(console, args)
	}

	this.info = function() {
		if(!this._checkLevel('info')) return;

		let args = Array.from(arguments)
		
		let prefixes = [this._ts(), 'INFO |']
		if(this.options.prefix) prefixes.push(this.options.prefix)
		args.unshift(...prefixes)

		console.info.apply(console, args)
	}

	this.warn = function() {
		if(!this._checkLevel('warn')) return;

		let args = Array.from(arguments)
		
		let prefixes = [this._ts(), 'WARN |']
		if(this.options.prefix) prefixes.push(this.options.prefix)
		args.unshift(...prefixes)

		console.warn.apply(console, args)
	}

	this.error = function() {
		if(!this._checkLevel('error')) return;

		let args = Array.from(arguments)
		
		let prefixes = [this._ts(), 'ERROR |']
		if(this.options.prefix) prefixes.push(this.options.prefix)
		args.unshift(...prefixes)

		console.error.apply(console, args)
	}


	return this
}

module.exports = log