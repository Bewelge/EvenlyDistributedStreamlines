var toDraw = []
function addDrawAct(action) {
	toDraw.push(action)
}
function drawNext(x) {
	while (x-- > 0 && toDraw.length) {
		toDraw.shift().do()
	}
}
class DrawAction {
	constructor(opts = {}) {
		if (opts.hasOwnProperty("action")) {
			this.action = opts.action
		}
	}
	do(c) {
		this.action(c)
	}
	static with(f) {
		return new DrawAction({ action: f })
	}
}

class CurvedLine extends DrawAction {
	constructor(opts = {}) {
		super()
		this.p1 = opts.p1
		this.p2 = opts.p2
		this.offset = opts.offset
		this.lineWidth = opts.lineWidth
		this.strokeStyle = opts.strokeStyle
		this.action = c => {
			c.strokeStyle = this.strokeStyle
			c.lineWidth = this.lineWidth
			curvedLine(c, this.p1, this.p2, this.offset)
		}
	}
}

class Line extends DrawAction {
	constructor(opts = {}) {
		super()
		this.p1 = opts.p1
		this.p2 = opts.p2
		this.lineWidth = opts.lineWidth
		this.strokeStyle = opts.strokeStyle
		this.action = c => {
			c.strokeStyle = this.strokeStyle
			c.lineWidth = this.lineWidth
			c.beginPath()
			c.moveTo(this.p1.x, this.p1.y)
			c.lineTo(this.p2.x, this.p2.y)
			c.stroke()
			c.closePath()
		}
	}
}
class Circle extends DrawAction {
	constructor(opts = {}) {
		super()
		this.p1 = opts.p1
		this.fillStyle = opts.fillStyle
		this.rad = opts.rad
		this.action = c => {
			c.fillStyle = this.fillStyle
			c.beginPath()
			c.arc(this.p1.x, this.p1.y, this.rad, 0, Math.PI * 2, 0)
			c.fill()
			c.closePath()
		}
	}
}
class StrokeCircle extends DrawAction {
	constructor(opts = {}) {
		super()
		this.p1 = opts.p1
		this.lineWidth = opts.lineWidth
		this.strokeStyle = opts.strokeStyle
		this.rad = opts.rad
		this.action = c => {
			c.strokeStyle = this.strokeStyle
			c.lineWidth = this.lineWidth
			c.beginPath()
			c.arc(this.p1.x, this.p1.y, this.rad, 0, Math.PI * 2, 0)
			c.stroke()
			c.closePath()
		}
	}
}
class StrokeEllipse extends DrawAction {
	constructor(opts = {}) {
		super()
		this.p1 = opts.p1
		this.lineWidth = opts.lineWidth
		this.strokeStyle = opts.strokeStyle
		this.rad = opts.rad
		this.rad2 = opts.rad2
		this.rotation = opts.rotation
		this.action = c => {
			c.strokeStyle = this.strokeStyle
			c.lineWidth = this.lineWidth
			c.beginPath()
			c.ellipse(
				this.p1.x,
				this.p1.y,
				this.rad,
				this.rad2,
				this.rotation,
				0,
				Math.PI * 2,
				0
			)
			c.stroke()
			c.closePath()
		}
	}
}
