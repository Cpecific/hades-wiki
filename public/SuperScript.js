

function extProt() {
	var prot = arguments[0]
	for (var i = 1; i < arguments.length;) {
		var name = arguments[i++]
		if (typeof name === 'string') { name = [name + ''] }
		var func = arguments[i++]
		for (var j = 0; j < name.length; ++j) {
			Object.defineProperty(prot, name[j], {
				enumerable: false,
				value: func
			})
		}
	}
}
function E(tag, attrs, html) {
	var el = document.createElement(tag)
	if (attrs) {
		for (const key in attrs) {
			el.setAttribute(key, attrs[key]);
		}
	}
	el.innerHTML = html || '';
	return el;
};
function ET(a) { return document.createTextNode(a) };
function NS(a, b, c){
	a = document.createElementNS('http://www.w3.org/2000/svg', a)
	if (b){
		for (var i in b){ a.setAttribute(i, b[i]) }
	}
	if (c){
		for (var i = 0; i < c.length; ++i){ a.setAttributeNS.apply(a, c[i]) }
	}
	return a
}


// Element.prototype
extProt(
	Element.prototype,
	'sa', Element.prototype.setAttribute,
	'ga', Element.prototype.getAttribute,
	'ra', Element.prototype.removeAttribute,
	'ha', Element.prototype.hasAttribute,
	['closest', 'C'], function (arr) {
		var a = this
		var b = []
		for (; a.parentNode && arr.length; a = a.parentNode) {
			for (var i = 0; i < arr.length; ++i) {
				if (a === arr[i]) {
					b.push(arr[i])
					arr.splice(i, 1)
					break
				}
			}
		}
		return b
	},
	['hasClosest', 'HC'], function (arr) {
		var a = this
		for (; a.parentNode; a = a.parentNode) {
			for (var i = 0; i < arr.length; ++i) {
				if (a === arr[i]) { return true }
			}
		}
		return false
	},
	'h', function (c) {
		this.innerHTML = c
		return this
	},
	't', function (c) {
		if (typeof c === 'undefined') { return this.textContent }
		this.textContent = c
		return this
	},
	'css', function (e) {
		for (var key in e) {
			this.style[key] = e[key]
		}
		return this
	},
	['show', 'S'], function () {
		this.style.display = (this.tagName.toLowerCase() === 'span' ? 'inline' : 'block')
		return this
	},
	['hide', 'H'], function () {
		this.style.display = 'none'
		return this
	},
	['toggle', 'TG'], function () {
		this[this.style.display === 'none' ? 'show' : 'hide']()
		return this
	},
	['append', 'A'], function (el) {
		this.appendChild(el)
		return this
	},
	'AA', function (arr) {
		if (arr instanceof Element) {
			this.appendChild(arr)
		}
		else {
			for (var i = 0; i < arr.length; ++i) {
				this.appendChild(arr[i])
			}
		}
		return this
	},
	['appendTo', 'T'], function (el) {
		el.appendChild(this)
		return this
	},
	['prepend', 'P'], function (el) {
		this.insertBefore(el, this.firstChild)
		return this
	},
	'PA', function (arr) {
		if (arr instanceof Array) {
			for (var i = 0; i < arr.length; ++i) {
				this.insertBefore(arr[i], this.firstChild)
			}
		} else {
			this.insertBefore(arr, this.firstChild)
		}
		return this
	},
	['before', 'B'], function (el) {
		this.parentNode.insertBefore(el, this)
		return this
	},
	['after', 'F'], function (el) {
		this.parentNode.insertBefore(el, this.nextSibling)
		return this
	},
	'R', function (el) {
		if (el) { this.removeChild(el) }
		else { this.parentNode.removeChild(this) }
		return this
	},
	'RA', function (arr) {
		if (arr instanceof Array) {
			for (var i = 0; i < arr.length; ++i) {
				this.removeChild(arr[i])
			}
		} else {
			this.removeChild(arr)
		}
		return this
	},
	'v', function (v) {
		if (typeof v === 'undefined') { return this.value }
		this.value = v
		return this
	},
	'tag', function () { return this.tagName.toLowerCase() },
	'prev', function () { return this.previousElementSibling },
	'next', function () { return this.nextElementSibling },
	'p', function (i) {
		if (!i) { return this.parentNode }
		var p = this
		for (; i > 0; --i) {
			p = p.parentNode
		}
		return p
	},
	'index', function (el) {
		for (var i = 0; i < this.children.length; ++i) {
			if (this.children[i] === el) { return i }
		}
		return -1
	},
	'CA', function (a) {
		this.classList.add(a)
		return this
	},
	'CR', function (a) {
		this.classList.remove(a)
		return this
	},
	'CT', function (a) {
		this.classList.toggle(a)
		return this
	},
	'CC', function (a) {
		return this.classList.contains(a)
	}
)

// HTMLDocument.prototype
extProt(
	HTMLDocument.prototype,
	'h', Element.prototype.h
)

// Element.prototype
if (Element.prototype.addEventListener) {
	extProt(
		Element.prototype,
		'on', function (type, handler) {
			this.addEventListener(type, handler, false)
			return this
		},
		'off', function (type, handler) {
			this.removeEventListener(type, handler, false)
			return this
		}
	)
}
else {
	extProt(
		Element.prototype,
		'on', function (type, handler) {
			this.attachEvent('on' + type, handler)
			return this
		},
		'off', function (type, handler) {
			this.detachEvent('on' + type, handler)
			return this
		}
	)
}

// Element.prototype
extProt(
	Element.prototype,
	'trigger', function () {
		this.dispatchEvent(new CustomEvent(arguments[0], {
			detail: Array.prototype.slice.call(arguments, 1)
		}))
		return this
	}
)

// Array.prototype
extProt(
	Array.prototype,
	'css', function (e) {
		for (var i = this.length - 1; i >= 0; --i) {
			for (var key in e) {
				this[i].style[key] = e[key]
			}
		}
		return this
	},
	'S', function () {
		for (var i = this.length - 1; i >= 0; --i) {
			this[i].S()
		}
	},
	'H', function () {
		for (var i = this.length - 1; i >= 0; --i) {
			this[i].H()
		}
	},
	'T', function (el) {
		for (var i = 0; i < this.length; ++i) {
			el.appendChild(this[i])
		}
		return this
	},
	'R', function (el) {
		for (var i = this.length - 1; i >= 0; --i) {
			this[i].parentNode.removeChild(this[i])
		}
		return []
	},
	'trigger', function (a) {
		arguments[0] = new Event(a)
		for (var i = 0; i < this.length; ++i) {
			this[i].trigger.apply(this, arguments)
		}
	},
	'CA', function (a) {
		for (var i = this.length - 1; i >= 0; --i) { this[i].CA(a) }
		return this
	},
	'CR', function (a) {
		for (var i = this.length - 1; i >= 0; --i) { this[i].CR(a) }
		return this
	},
	'CT', function (a) {
		for (var i = this.length - 1; i >= 0; --i) { this[i].CT(a) }
		return this
	},
	'CC', function (a) {
		for (var i = this.length - 1; i >= 0; --i) {
			if (this[i].classList.contains(a)) { return this[i] }
		}
		return false
	},
	'v', function () {
		var v = []
		for (var i = this.length - 1; i >= 0; --i) {
			v.push(this[i].value)
		}
		return v
	},
	'not', function (a) {
		if (a instanceof Array) {
			for (var j = a.length - 1; j >= 0; --j) {
				var b = a[j]
				for (var i = this.length - 1; i >= 0; --i) {
					if (this[i] === b) {
						this.splice(i, 1)
						break
					}
				}
			}
		} else {
			for (var i = this.length - 1; i >= 0; --i) {
				if (this[i] === a) {
					this.splice(i, 1)
					return this
				}
			}
		}
		return this
	},
	'add', function (a) {
		if (a instanceof Array) {
			for (var j = a.length - 1; j >= 0; --j) {
				var b = a[j]
				for (var i = this.length - 1; i >= 0; --i) {
					if (this[i] === b) { break }
				}
				if (i === -1) { this.push(b) }
			}
		} else {
			for (var i = this.length - 1; i >= 0; --i) {
				if (this[i] === a) { return this }
			}
			this.push(a)
		}
		return this
	},
	'has', function (a) {
		for (var i = this.length - 1; i >= 0; --i) {
			if (this[i] === a) { return true }
		}
		return false
	},
	/*Array.prototype.index = function(a){
		for (var i = this.length - 1; i >= 0; --i){
			if (this[i] === a){ return i }
		}
		return -1
	}*/
	'index', Array.prototype.indexOf,
	'each', Array.prototype.forEach,
	//function ArrayOnlyUnique(value, index, self){ return self.indexOf(value) === index }
	'unique', function () {
		//return a.filter(ArrayOnlyUnique)
		var v = []
		for (var i = 0; i < this.length; ++i) {
			if (this.index(this[i]) === i) {
				v.push(this[i])
			}
		}
		return v
	},
	'toKeys', function () {
		var v = {}
		for (var i = 0; i < this.length; ++i) {
			v[arguments[i]] = this[i]
		}
		return v
	},
	'isSubset', function (parent) {
		var v = this.slice()
		while (v.length) {
			var ok = false
			for (var j = 0; j < parent.length; ++j) {
				if (v[0] === parent[j]) {
					ok = true
					v.splice(0, 1)
					break
				}
			}
			if (!ok) { break }
		}
		return (v.length === 0)
	},
	// contains at least one in
	'caoi', function (arr) {
		for (var i = this.length - 1; i >= 0; --i) {
			for (var j = arr.length - 1; j >= 0; --j) {
				if (this[i] === arr[j]) { return true }
			}
		}
		return false
	},
	'empty', function () {
		return this.length === 0
	},
	'toObject', function () {
		var v = {}
		for (var i = 0; i < this.length; ++i) {
			v[i] = this[i]
		}
		return v
	},
	'copy', function () {
		var arr = this.slice()
		for (var i = 0; i < arr.length; ++i) {
			if (arr[i] && typeof arr[i] === 'object') { arr[i] = arr[i].copy() }
		}
		return arr
	},
	'myFind', function (val) {
		for (var i = 0; i < this.length; ++i) {
			var a = this[i]
			for (var j = 1; j < arguments.length; ++j) {
				a = a[arguments[j]]
			}
			if (a === val) { return this[i] }
		}
		return null
	}
)

