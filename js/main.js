window.$fxhashFeatures = {}

class Grid {
	constructor() {
		this.init()
	}
	init() {
		this.gridSize = opts.gridSize
		this.tileSize = width / this.gridSize
		this.tiles = Array(this.gridSize)
			.fill(0)
			.map(_ =>
				Array(this.gridSize)
					.fill(0)
					.map(__ => [])
			)
	}
	getNeighbours(cell) {
		let neighbors = []
		if (cell.x > 0) {
			neighbors.push(new Vec2(cell.x - 1, cell.y))
		}
		if (cell.y > 0) {
			neighbors.push(new Vec2(cell.x, cell.y - 1))
		}
		if (cell.x < this.gridSize - 1) {
			neighbors.push(new Vec2(cell.x + 1, cell.y))
		}
		if (cell.y < this.gridSize - 1) {
			neighbors.push(new Vec2(cell.x, cell.y + 1))
		}
		if (cell.x > 0 && cell.y > 0) {
			neighbors.push(new Vec2(cell.x - 1, cell.y - 1))
		}
		if (cell.x > 0 && cell.y < this.gridSize - 1) {
			neighbors.push(new Vec2(cell.x - 1, cell.y + 1))
		}
		if (cell.x < this.gridSize - 1 && cell.y > 0) {
			neighbors.push(new Vec2(cell.x + 1, cell.y - 1))
		}
		if (cell.x < this.gridSize - 1 && cell.y < this.gridSize - 1) {
			neighbors.push(new Vec2(cell.x + 1, cell.y + 1))
		}
		return neighbors
	}
	getCell(x, y) {
		return {
			x: Math.max(
				0,
				Math.min(this.gridSize - 1, Math.floor(x / this.tileSize))
			),
			y: Math.max(0, Math.min(this.gridSize - 1, Math.floor(y / this.tileSize)))
		}
	}
	getCellForP(p) {
		return {
			x: Math.max(
				0,
				Math.min(this.gridSize - 1, Math.floor(p.x / this.tileSize))
			),
			y: Math.max(
				0,
				Math.min(this.gridSize - 1, Math.floor(p.y / this.tileSize))
			)
		}
	}
	getPointsForCell(cell) {
		return this.tiles[cell.y][cell.x].slice(0)
	}
	addPoint(p) {
		let cell = this.getCellForP(p)
		this.tiles[cell.y][cell.x].push(p.copy())
	}
	isCellOkay(p, cell) {
		return (
			this.getPointsForCell(cell).find(
				p1 => p1.distanceTo(p) < opts.disSeperation
			) == undefined
		)
	}
	checkPoint(p) {
		if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) {
			return false
		}
		let cell = this.getCellForP(p)
		if (!this.isCellOkay(p, cell)) return false
		let neighborsOkay =
			this.getNeighbours(cell).find(
				neighborCell => !this.isCellOkay(p, neighborCell)
			) == undefined

		return neighborsOkay
	}
}

let curvesToDraw = []

var opts = {
	gridSize: 100,
	flowFieldSize: 100,
	flowFieldSmoothness: 0.3,
	flowFieldPerlin: true,
	flowFieldPerlinResolution: 100,
	samplesPerCurve: 2,
	curveLength: 14,
	iterationsPerFrame: 100,
	disSeperation: 4,
	lineWidth: 1
}

let ff = getFlowField()
let grid = new Grid(opts.gridSize)

function getFlowField() {
	let ff = new Flowfield(opts.flowFieldSize, opts.flowFieldPerlin)
	ff.smooth(opts.flowFieldSmoothness)
	return ff
}

function findSample() {
	return Vec2.random()
}

function getCurveSamplePoints(curve) {
	return Array(opts.samplesPerCurve)
		.fill(0)
		.map((_, i) => curve.getPointAt(i / opts.samplesPerCurve))
}

function construcCurveFromSamplePoint(p) {
	let points = []
	while (grid.checkPoint(p)) {
		grid.addPoint(p.copy())
		points.push(p.copy())
		let ang = ff.getAng(p.x, p.y)
		p.addAngle(ang, opts.curveLength)
	}
	if (points.length > 2) {
		let curves = smoothLineThroughPoints(new Path2D(), points, true).curves
		curves.forEach(curve =>
			getCurveSamplePoints(curve).forEach(curveP => grid.addPoint(curveP))
		)
		curvesToDraw.push(curves)
	}
}

function placeNewLine() {
	for (let i = 0; i < opts.iterationsPerFrame; i++) {
		let p = findSample()
		construcCurveFromSamplePoint(p)
	}
}

function getPotentialCurve(p) {
	let newP = p.copy().addAngle()
}

function clearRestart() {
	c.clearRect(0, 0, width, height)
	curvesToDraw = []
	ff = getFlowField()
	grid.init()
}

c.lineWidth = 1
function render() {
	if (paused) {
		window.requestAnimationFrame(render)
		return
	}
	c.strokeStyle = getRandomColor()
	curvesToDraw = []
	placeNewLine()
	curvesToDraw
		.flatMap(m => m)
		.forEach(curve => {
			c.beginPath()
			curve.doCurveTo(c)
			c.stroke()
			c.closePath()
		})
	window.requestAnimationFrame(render)
}

const gui = new dat.GUI()

//Think this only influences performance, dependent on canvas dimensions
// gui
// 	.add(opts, "gridSize", 10, 1000, 1)
// 	.onChange(v => clearRestart())
// 	.name("Grid Size")
let ffFolder = gui.addFolder("FlowField")
ffFolder
	.add(opts, "flowFieldSize", 10, 1000, 1)
	.onChange(v => clearRestart())
	.name("Grid Size")
ffFolder
	.add(opts, "flowFieldSmoothness", 0, 1, 0.01)
	.onChange(v => clearRestart())
	.name("Smoothing")
ffFolder
	.add(opts, "flowFieldPerlin", true)
	.onChange(v => clearRestart())
	.name("Use Perlin noise")
ffFolder
	.add(opts, "flowFieldPerlinResolution", 1, 250, 0.1)
	.onChange(v => clearRestart())
	.name("Perlin Resolution")

gui
	.add(opts, "samplesPerCurve", 2, 1000, 1)
	.onChange(v => clearRestart())
	.name("Sample / Curve")
gui
	.add(opts, "curveLength", 2, 250, 1)
	.onChange(v => clearRestart())
	.name("Curve length")
gui
	.add(opts, "disSeperation", 1, 100, 0.1)
	.onChange(v => clearRestart())
	.name("Seperation")

let renderFolder = gui.addFolder("Rendering")
renderFolder
	.add(opts, "iterationsPerFrame", 0, 1000, 1)
	.name("Iterations/Frame")
renderFolder
	.add(opts, "lineWidth", 0.01, 25, 0.01)
	.name("Linewidth")
	.onChange(t => (c.lineWidth = opts.lineWidth))

render()
