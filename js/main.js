const ITERATION_LIMIT = 1000
class Grid {
	constructor() {
		this.init()
		this.tmpPoints = []
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
	addTmpPoint(p) {
		this.tmpPoints.push(p.copy())
	}
	clearTmp() {
		this.tmpPoints = []
	}
	addTmps() {
		this.tmpPoints.forEach(p => this.addPoint(p))
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
		if (this.tmpPoints.find(tp => tp.distanceTo(p) < opts.disSeperation)) {
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

let dSep = 6
let curveLength = 7
var opts = {
	gridSize: Math.ceil(width / dSep),
	samplesPerCurve: Math.max(2, Math.ceil(curveLength / curveLength)),
	flowFieldSize: 100,
	flowFieldSmoothness: 0.3,
	flowFieldPerlin: true,
	flowFieldPerlinResolution: 18,
	curveLength: curveLength,
	iterationsPerFrame: 100,
	disSeperation: dSep,
	lineWidth: 3,
	bgColor: "rgb(10, 10, 10)",
	githubLink: () =>
		(window.location =
			"https://github.com/Bewelge/EvenlyDistributedStreamlines")
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
	grid.clearTmp()
	let points = []
	let counter = 0
	while (grid.checkPoint(p) && counter < ITERATION_LIMIT) {
		counter++
		grid.addTmpPoint(p.copy())
		points.push(p.copy())
		let ang = ff.getAng(p.x, p.y)
		p.addAngle(ang, opts.curveLength)
	}
	if (points.length > 2) {
		grid.addTmps()
		let curves = getSmoothCurveThroughPoints(points)
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

function clearRestart() {
	c.clearRect(0, 0, width, height)
	curvesToDraw = []
	ff = getFlowField()
	grid.init()
}

c.lineWidth = opts.lineWidth
function render() {
	if (paused) {
		window.requestAnimationFrame(render)
		return
	}

	curvesToDraw = []

	placeNewLine()

	c.strokeStyle = getRandomColor()
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
ffFolder.open()

//computed automatically
// gui
// 	.add(opts, "samplesPerCurve", 2, 1000, 1)
// 	.onChange(v => clearRestart())
// 	.name("Sample / Curve")

gui
	.add(opts, "curveLength", 2, 150, 1)
	.onChange(v => {
		opts.gridSize = Math.ceil(width / opts.disSeperation)

		opts.samplesPerCurve = Math.max(2, Math.ceil(opts.curveLength / 5))

		clearRestart()
	})
	.name("Curve length")
gui
	.add(opts, "disSeperation", 1, 50, 0.1)
	.onChange(v => clearRestart())
	.name("Seperation")

let renderFolder = gui.addFolder("Rendering")
renderFolder.open()
renderFolder
	.addColor(opts, "bgColor")
	.onChange(t => (document.body.style.backgroundColor = opts.bgColor))
	.name("Background-Color")
renderFolder
	.add(opts, "iterationsPerFrame", 0, 1000, 1)
	.name("Iterations/Frame")
renderFolder
	.add(opts, "lineWidth", 0.1, 25, 0.1)
	.name("Linewidth")
	.onChange(t => (c.lineWidth = opts.lineWidth))

gui.add(opts, "githubLink").name("Github Project")

render()
