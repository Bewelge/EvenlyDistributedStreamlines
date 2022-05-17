const PI = Math.PI
const PI2 = Math.PI * 2
const PI05 = Math.PI * 0.5
class Vec2 {
	constructor(x = 0, y = 0) {
		this._x = x
		this._y = y
	}
	get x() {
		return this._x
	}
	get y() {
		return this._y
	}
	get length() {
		return this.distanceToOrigin()
	}
	addVector(vector) {
		this._x += vector.x
		this._y += vector.y
		return this
	}
	add(x, y) {
		this._x += x
		this._y += y
		return this
	}
	subtractVector(vector) {
		this._x -= vector.x
		this._y -= vector.y
		return this
	}
	addAngle(angle, dist) {
		this._x += Math.cos(angle) * dist
		this._y += Math.sin(angle) * dist
		return this
	}
	multiply(number) {
		this._x *= number
		this._y *= number
		return this
	}
	rotateAround(vec, ang) {
		let curAng = this.angleTo(vec)
		let dis = vec.distanceTo(this)
		let newP = vec.copy().addAngle(curAng + ang, -dis)

		this._x = newP.x
		this._y = newP.y
		return this
	}
	ceiling(num) {
		this._x = Math.min(num, this._x)
		this._y = Math.min(num, this._y)
		return this
	}
	bottom(num) {
		this._x = Math.max(num, this._x)
		this._y = Math.max(num, this._y)
		return this
	}
	peg(min, max) {
		this.ceiling(max)
		this.bottom(min)
		return this
	}
	distanceTo(vector) {
		return distancePoints(this, vector)
	}
	distanceToOrigin() {
		return distancePoints(this, Vec2.origin())
	}
	angleTo(vector) {
		return anglePoints(this, vector)
	}
	angleToOrigin() {
		return this.angleTo(Vec2.origin())
	}
	copy() {
		return new Vec2(this._x, this._y)
	}
	isInBound() {
		return this._x > 0 && this._x < width && this._y > 0 && this._y < height
	}
	mirrorAcross(p0, p1) {
		let vx = p1.x - p0.x
		let vy = p1.y - p0.y
		let x = p0.x - this.x
		let y = p0.y - this.y
		let r = 1 / (vx * vx + vy * vy)
		this._x = this.x + 2 * (x - x * vx * vx * r - y * vx * vy * r)
		this._y = this.y + 2 * (y - y * vy * vy * r - x * vx * vy * r)

		return this
	}
	debug() {
		c.save()
		c.fillStyle = "black"
		c.globalCompositeOperation = "source-over"
		c.beginPath()
		c.arc(this.x, this.y, 5, 0, PI2)
		c.stroke()
		c.closePath()
		c.restore()
	}

	static middle(w = width, h = height) {
		return new Vec2(w / 2, h / 2)
	}
	static middleOf(vec1, vec2, a = 0.5) {
		return new Vec2(
			vec1.x * (1 - a) + a * vec2.x,
			vec1.y * (1 - a) + a * vec2.y
		)
	}
	static random(margin = 0, x = width, y = height) {
		return new Vec2(
			randomInt(margin, x - margin),
			randomInt(margin, y - margin)
		)
	}
	static create(x, y) {
		return new Vec2(x, y)
	}
	static origin() {
		return new Vec2(0, 0)
	}
}

function anglePoints(point1, point2) {
	return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}
function distancePoints(point1, point2) {
	return Math.sqrt(
		(point1.x - point2.x) * (point1.x - point2.x) +
			(point1.y - point2.y) * (point1.y - point2.y)
	)
}
function angle(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1)
}
function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}
function randomInt(min, max) {
	return Math.floor(randomFloat(min, max))
}
function randomFloat(min, max) {
	return min + fxrand() * (max - min)
}

function clamp(val, min, max) {
	return Math.min(max, Math.max(min, val))
}
function rgba(r, g, b, a) {
	return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

function createCanvas(width, height) {
	width = width || 50
	height = height || 50
	const cnv = document.createElement("canvas")
	cnv.width = width
	cnv.height = height
	return cnv
}
CanvasRenderingContext2D.prototype.fillCircle = function (x, y, radius) {
	this.beginPath()
	this.arc(x, y, radius, 0, Math.PI * 2, 0)
	this.fill()
	this.closePath()
}

function curvedLine(c, p1, p2, offset) {
	c.beginPath()
	c.moveTo(p1.x, p2.x)
	let mx = (p1.x + p2.x) / 2
	let my = (p1.y + p2.y) / 2
	let ang = p1.angleTo(p2)
	let c1 = new Vec2(
		mx + Math.cos(ang + Math.PI * 0.5) * offset,
		my + Math.sin(ang + Math.PI * 0.5) * offset
	)
	let c2 = new Vec2(
		mx + Math.cos(ang - Math.PI * 0.5) * offset,
		my + Math.sin(ang - Math.PI * 0.5) * offset
	)
	c.bezierCurveTo(c1.x, c1.y, c2.y, c2.y, p2.x, p2.y)
	c.stroke()
	c.closePath()
}

function doXTimes(times, toDo) {
	let tmp = times
	while (times--) {
		toDo(tmp - (times + 1))
	}
}

function rndFloat(min = 0, max = 1) {
	return min + (max - min) * fxrand()
}
function rndInt(min = 0, max = 1) {
	return Math.floor(min + (max - min) * fxrand() + 0.5)
}
function rndAng() {
	return rndFloat(0, Math.PI * 2)
}

function getClosestDirection(fromAngle, toAngle, turnSpeed) {
	let provisional = toAngle - fromAngle
	while (provisional < 0) {
		provisional += Math.PI * 2
	}
	return provisional < Math.PI ? -1 : provisional > Math.PI ? 1 : 0
}

function strokeLine(c, vec1, vec2) {
	strokeLines(c, vec1, vec2)
}

function strokeLines(c, ...vecs) {
	if (vecs.length > 1) {
		c.beginPath()
		c.moveTo(vecs[0].x, vecs[0].y)
		for (let i = 1; i < vecs.length; i++) {
			c.lineTo(vecs[i].x, vecs[i].y)
		}
		c.closePath()
		c.stroke()
	}
}

function getRandomColor() {
	return colorPalletes[thePallete][
		rndInt(0, colorPalletes[thePallete].length - 1)
	]
}

function isPreview() {
	var canvas = document.createElement("canvas")
	var gl
	var debugInfo
	var vendor
	var renderer

	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
	} catch (e) {}

	if (gl) {
		debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
		vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
		renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
	}
	return renderer == "Google SwiftShader"
}

window.addEventListener("keydown", e => {
	switch (e.code) {
		case "Space":
			paused = !paused
			break
		case "ArrowUp":
			speed++
			break
		case "ArrowDown":
			speed = Math.max(1, speed - 1)
			break
		case "KeyS":
			let a = document.createElement("a")
			a.href = cnv.toDataURL()
			a.download = document.title + " by Bewelge"
			a.click()
			break
	}
})
function smoothLineThroughPoints(path, points, dontClose) {
	points = points.map(pos => new Vec2(pos.x, pos.y))
	let curves = []
	!dontClose ? points.push(points[0]) : null
	let str = ""
	// move to the first point
	let curP = points[0]
	path.moveTo(points[0].x, points[0].y)
	str += "M " + points[0].x + " " + points[0].y
	var i
	for (i = 1; i < points.length - 2; i++) {
		var xc = (points[i].x + points[i + 1].x) / 2
		var yc = (points[i].y + points[i + 1].y) / 2
		path.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
		str += " Q " + points[i].x + " " + points[i].y + " " + xc + " " + yc
		curves.push(new QuadraticCurve(curP, points[i], new Vec2(xc, yc)))
		curP = new Vec2(xc, yc)
	}
	// curve through the last two points
	try {
		str +=
			" Q " +
			points[i].x +
			" " +
			points[i].y +
			" " +
			points[i + 1].x +
			" " +
			points[i + 1].y
		path.quadraticCurveTo(
			points[i].x,
			points[i].y,
			points[i + 1].x,
			points[i + 1].y
		)
		curves.push(
			new QuadraticCurve(
				curP,
				points[i],
				new Vec2(points[i + 1].x, points[i + 1].y)
			)
		)
	} catch (error) {
		console.log(error)
	}
	return { path, curves, str }
}
function raggedLineThroughPoints(p, points) {
	let ps = points.map(pos => new Vec2(pos.x, pos.y))
	let curP = ps[0]
	ps.forEach(point => {
		let curRatio = 0
		let ang = curP.angleTo(point)
		let dis = curP.distanceTo(point)
		for (let i = 0; i < 10; i++) {
			// if (point.distanceTo(curP)>10) {
			let newP = curP.copy().addAngle(ang, (dis * i) / 10)

			let lngt = rndInt(1, 5)
			let aAng = ang + rndFloat(-0.05, 0.05)
			p.moveTo(newP.x, newP.y)
			p.lineTo(newP.x + Math.cos(aAng) * lngt, newP.y + Math.sin(aAng) * lngt)
			// }
		}
		curP = point
	})
	return p
}
function getSignedAng(ang0, ang1) {
	ang0 < 0 ? (ang0 += PI2) : null
	let diff = ang0 - ang1

	return ((diff + PI) % PI2) - PI
}
