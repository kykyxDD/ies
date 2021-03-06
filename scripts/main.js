var main = {}

main.linesOnly = false
main.linesVisible = true
main.rotation = 0
main.info_ies = false

function init() {
	main.bus   = new EventEmitter
	main.ui    = new UI({
		events: main.bus,
		eroot: document.body
	})
	main.view  = new View3(main.ui.viewport)
	main.timer = new Timer(onTick)
	main.builder = new DataBuilder
	main.view_azim = new ViewAzim()
	main.view_info_ies = new ViewInfoIES()
	main.initData = new initData()
	main.createDataSum = new CreateDataSum()

	run()
}

function run() {
	datinit()
	eventmap()
	onResize()
	main.timer.play()
}

function datinit() {
	main.gui = new dat.GUI({
		autoPlace: false,
		hideable: true
	})

	// dom.append(main.ui.viewport, main.gui.domElement)

	// main.gui.add(main.view, 'enableWire').name('Wireframe').onChange(v3redraw).listen()

	// main.gui.add(main, 'linesOnly').name('Lines Only').onChange(onMaterial)
	// main.gui.add(main, 'linesVisible').name('Lines Visible').onChange(onMaterial)

	var cont_change = dom.div('dg main', main.ui.viewport);

	var cont_view_figure = dom.div('change_view_figure' , cont_change)

	var cont_all = dom.div('change cont_all', cont_view_figure);
	var input_all = dom.input('radio', 'input_change all', cont_all);
	input_all.setAttribute('name', 'figure');
	input_all.id = 'change_all';
	input_all.checked = true
	var label_all = dom.elem('label', 'label_change all', cont_all);
	label_all.setAttribute('for', 'change_all');

	dom.on('change', input_all, function(){
		onChangeFigure('all');
	});

	var cont_figure = dom.div('change cont_figure', cont_view_figure);
	var input_figure = dom.input('radio', 'input_change figure', cont_figure);
	input_figure.setAttribute('name', 'figure');
	input_figure.id = 'change_figure';
	var label_figure = dom.elem('label', 'label_change figure', cont_figure);
	label_figure.setAttribute('for', 'change_figure');

	dom.on('change', input_figure, function(){
		onChangeFigure('figure');
	});

	var cont_line = dom.div('change cont_line', cont_view_figure);
	var input_line = dom.input('radio', 'input_change line', cont_line);
	input_line.setAttribute('name', 'figure');
	input_line.id = 'change_line';
	var label_line = dom.elem('label', 'label_change line', cont_line);
	label_line.setAttribute('for', 'change_line');

	dom.on('change', input_line, function(){
		onChangeFigure('line');
	});

	var change_bg = dom.div('cont_change_bg', cont_change);

	var cont_select_bg = dom.div('change bg_white', change_bg);
	var elem_slide = dom.div('slideThree', cont_select_bg);
	var input_change = dom.input('radio', false, elem_slide);
	input_change.id = 'bg_white';
	input_change.setAttribute('name', "check");

	var label = dom.elem('label', false, elem_slide);
	label.setAttribute('for', 'bg_white');

	dom.on('change', input_change, function(){
		main.view.changeBG('white')
	})

	var cont_select_bg = dom.div('change bg_black', change_bg);
	var elem_slide = dom.div('slideThree', cont_select_bg);
	var input_change = dom.input('radio', false, elem_slide);
	input_change.id = 'bg_black';
	input_change.checked = true
	input_change.setAttribute('name', "check");

	var label = dom.elem('label', false, elem_slide);
	label.setAttribute('for', 'bg_black');


	dom.on('change', input_change, function(){
		main.view.changeBG('black')
	})


	var cont_select_bg = dom.div('change bg_grey', change_bg);
	var elem_slide = dom.div('slideThree', cont_select_bg);
	var input_change = dom.input('radio', false, elem_slide);
	input_change.id = 'bg_grey';
	input_change.setAttribute('name', "check");

	var label = dom.elem('label', false, elem_slide);
	label.setAttribute('for', 'bg_grey');

	dom.on('change', input_change, function(){
		main.view.changeBG('grey')
	})

	function v3redraw() {
		main.view.needsRedraw = true
	}
}

function datextra() {
	if(main.datextra) return
	main.datextra = true

	main.gui.add(main.builder, 'colorK').min(-1).max(1).name('Color magnitude').onChange(rebuild)
	main.gui.add(main.builder, 'colorA').min(-1).max(1).name('Color offset').onChange(rebuild)
	main.gui.add(main, 'rotation').min(0).max(10).name('Rotation')
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
	if(main.rotation) {
		main.view.orbit.rotateLeft(main.rotation * dt * 0.0001)
		main.view.orbit.update()
	}
	main.view.onUpdate(dt)
}

function onKey(e) {
	if(kbd.key === 'v' && !main.datextra) datextra()

	main.view.onKey(e)
}

function onResize() {
	main.view.onResize()
}

function onData(data) {
	main.dataSource = data
	rebuild()
	// onMaterial()
	// main.view.toCenter()
}

function onMaterial() {
	if(!main.tree) return

	main.builder.updateMaterial()

	main.view.needsRedraw = true
}
function onChangeFigure(val){
	if(val == 'all'){ 
		main.linesOnly = false
		main.linesVisible = true
	} else if(val == 'figure'){ 
		main.linesOnly = false
		main.linesVisible = false
	} else if(val == 'line'){ 
		main.linesOnly = true
		main.linesVisible = true
	} 
	onMaterial()

}

function rebuild() {
	if(!main.dataSource) return
	main.tree = main.builder.buildFromSource(main.dataSource, true)
	// main.view.setTree(main.tree)
}


init()
