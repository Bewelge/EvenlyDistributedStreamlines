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
		return new Vec2(rndInt(margin, x - margin), rndInt(margin, y - margin))
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

function rndFloat(min = 0, max = 1) {
	return min + (max - min) * Math.random()
}
function rndInt(min = 0, max = 1) {
	return Math.floor(min + (max - min) * Math.random() + 0.5)
}
function rndAng() {
	return rndFloat(0, Math.PI * 2)
}

function getRandomColor() {
	return colorPalletes[thePallete][
		rndInt(0, colorPalletes[thePallete].length - 1)
	]
}

window.addEventListener("keydown", e => {
	switch (e.code) {
		case "Space":
			paused = !paused
			break

		case "KeyS":
			let a = document.createElement("a")
			let tmpCnv = createCanvas(cnv.width, cnv.height)
			let tmpC = tmpCnv.getContext("2d")
			tmpC.fillStyle = opts.bgColor
			tmpC.fillRect(0, 0, width, height)
			tmpC.drawImage(cnv, 0, 0)

			a.href = tmpCnv.toDataURL()
			a.download = document.title + " by Bewelge"
			a.click()
			break
	}
})
function getSmoothCurveThroughPoints(points) {
	points = points.map(pos => new Vec2(pos.x, pos.y))
	let curves = []

	let curP = points[0]
	var i
	for (i = 1; i < points.length - 2; i++) {
		var xc = (points[i].x + points[i + 1].x) / 2
		var yc = (points[i].y + points[i + 1].y) / 2
		curves.push(new QuadraticCurve(curP, points[i], new Vec2(xc, yc)))
		curP = new Vec2(xc, yc)
	}

	curves.push(
		new QuadraticCurve(
			curP,
			points[i],
			new Vec2(points[i + 1].x, points[i + 1].y)
		)
	)

	return curves
}

function getSignedAng(ang0, ang1) {
	ang0 < 0 ? (ang0 += PI2) : null
	let diff = ang0 - ang1

	return ((diff + PI) % PI2) - PI
}
