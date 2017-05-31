var main = {}

main.subdivisions = 0
main.linesOnly = false

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

	gui.add(main, 'linesOnly').name('Lines Only').onChange(onLinesOnly)
	// gui.add(main, 'subdivisions').min(0).max(8).step(1).name('Subdivisions').onChange(rebuild)

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

function onTick(dt) {
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
	onLinesOnly()
}

function onLinesOnly() {
	if(!main.tree) return
	main.tree.lineRoot.visible =  main.linesOnly
	main.tree.meshRoot.visible = !main.linesOnly
	main.view.needsRedraw = true
}

function rebuild() {
	if(!main.dataSource) return
	main.tree = main.builder.buildFromSource(main.dataSource, main.subdivisions, main.linesOnly)
	main.view.setTree(main.tree)
}


init()
