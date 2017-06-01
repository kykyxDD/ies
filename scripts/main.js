var main = {}

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

	gui.add(main.builder, 'heights').min(0).max(16).step(1).name('Heights').onChange(rebuild)
	gui.add(main.builder, 'verticals').min(1).max(8).step(1).name('Verticals').onChange(rebuild)
	gui.add(main.builder, 'subdivisions').min(0).max(32).step(1).name('Subdivisions').onChange(rebuild)
	gui.add(main.builder, 'colorK').min(0.001).max(0.3).name('Color magnitude').onChange(rebuild)
	gui.add(main.builder, 'colorA').min(-1).max(1).name('Color offset').onChange(rebuild)

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
	main.tree = main.builder.buildFromSource(main.dataSource)
	main.view.setTree(main.tree)
}


init()
