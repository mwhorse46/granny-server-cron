Array.prototype.fixedPush = function(element, length) {
	if(this.length + 1 > length) this.shift();
	this.push(element);
}