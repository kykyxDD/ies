var main = {}

main.subdivisions = 0
main.heights = 6
main.linesOnly = false
main.linesVisible = true

function init() {
	main.bus   = new EventEmitter
	main.ui    = new UI({
		events: main.bus,
		eroot: document.body
	})
	main.view  = new View3(main.ui.viewport)
	main.timer = new Timer(onTick)
	main.builder = new DataBuilder

	run()
}

function run() {
	datinit()
	eventmap()
	onResize()
	main.timer.play()
}

function datinit() {
	var gui = new dat.GUI({
		autoPlace: false,
		hideable: true
	})

	dom.append(main.ui.viewport, gui.domElement)


	// gui.add(main.view, 'enableWire').name('Wireframe').onChange(v3redraw).listen()

	gui.add(main, 'linesOnly').name('Lines Only').onChange(onMaterial)
	gui.add(main, 'linesVisible').name('Lines Visible').onChange(onMaterial)
	gui.add(main, 'heights').min(0).max(16).step(1).name('Heights').onChange(rebuild)
	gui.add(main, 'subdivisions').min(0).max(16).step(1).name('Subdivisions').onChange(rebuild)

	function v3redraw() {
		main.view.needsRedraw = true
	}
}

function eventmap() {
	dom.on('keydown', window, onKey)
	dom.on('keyup',   window, onKey)
	dom.on('resize',  window, onResize)

	main.bus.when({
		'data_input': onData
	})
}

function onTick(t, dt) {
	main.view.onUpdate(dt)
}

function onKey(e) {
	main.view.onKey(e)
}

function onResize() {
	main.view.onResize()
}

function onData(data) {
	main.dataSource = data
	rebuild()
	onMaterial()
	main.view.toCenter()
}

function onMaterial() {
	if(!main.tree) return

	main.builder.meshMaterial.visible = !main.linesOnly

	main.builder.lineMaterial.color.set(main.linesOnly ? 0xffffff : 0x000000)
	main.builder.lineMaterial.vertexColors = main.linesOnly ? THREE.VertexColors : 0
	main.builder.lineMaterial.visible = main.linesVisible


	main.builder.lineMaterial.needsUpdate = true

	main.view.needsRedraw = true
}

function rebuild() {
	if(!main.dataSource) return
	main.tree = main.builder.buildFromSource(main.dataSource, {
		subdivisions: main.subdivisions,
		heights: main.heights,
	})
	main.view.setTree(main.tree)
}


init()
