function ViewInfoIES(){
	var self = this
	//var parent = main.ui.viewport
	this.obj_elem = {};
	var index = 0;
	var max_val = 0

	var mediaQueryList = window.matchMedia('print');
	mediaQueryList.addListener(function(mql) {
		if (mql.matches) {
			mql.preventDefault();
			mql.stopPropagation();
			main.view.renderer.setClearColor(0xffffff);
			window.onResize();
			console.log('onResize matches width',main.view.element.offsetWidth, main.view.renderer.domElement.width)
			console.log('onResize matches height',main.view.element.offsetHeight, main.view.renderer.domElement.height)
			// window.print();
		} else {
			main.view.renderer.setClearColor(main.view.background);
			window.onResize();
			console.log('onResize',main.view.element.offsetWidth, main.view.element.offsetHeight)
		}
		
	});
	// window.onclose = function(){
	// 	main.view.renderer.setClearColor(main.view.background);
	// }

	this.init = function(){

		this.visPopupEdit = false
		var cont = dom.elem('div', 'info_ies', main.ui.viewport)
		this.obj_elem.parent = cont;
		var logo = dom.elem('div', 'logo', main.ui.viewport)
		var cont_info = dom.elem('div', 'cont_info', cont);

		this.createPopup(cont, cont_info);

		this.obj_elem.cont_info = cont_info;

		this.obj_elem.test = createElemInfo('test');
		this.obj_elem.data = createElemInfo('data');
		this.obj_elem.manufac = createElemInfo('manufac');
		this.obj_elem.lumcat = createElemInfo('lumcat');
		this.obj_elem.luminaire = createElemInfo('luminaire');
		this.obj_elem.lampcat = createElemInfo('lampcat');
		this.obj_elem.lamp = createElemInfo('lamp');
		this.obj_elem.other = createElemInfo('other');

		this.obj_elem.light_flow = createElemInfo('Light flow')

		this.obj_elem.power = createElemInfo('power');
		this.obj_elem.polar = createElemInfo('polar', 'Number of polar angles');
		this.obj_elem.azim =  createElemInfo('polar', 'Number of azimuth angles');

		var cont_vis_azim = dom.elem('div', 'vis_azim', cont);
		var cont_btn = dom.elem('div', 'cont_switch', cont_vis_azim);
		var btn_prev = dom.elem('div', 'angle prev_angle', cont_btn);
		var icon_btn_prev = dom.elem('div', 'icon', btn_prev);
		var cont_val = dom.elem('div', 'cont_val', cont_btn);
		var text_vis = dom.elem('div', 'val', cont_val);
		var cont_list_val = dom.elem('div', 'cont_list_val', cont_val);
		var list_val = dom.elem('div', 'list_val', cont_list_val);
		var btn_next = dom.elem('div', 'angle next_angle', cont_btn);
		var icon_btn_next = dom.elem('div', 'icon', btn_next);
		var cont_view = dom.elem('div', 'cont_view', cont_vis_azim) ;
		this.obj_elem.text_azim = text_vis;
		this.obj_elem.btn_prev = btn_prev
		this.obj_elem.btn_next = btn_next
		this.obj_elem.elem_list_val = list_val;
		this.obj_elem.list_val = [];
		main.view_azim.init(cont_view);
		dom.text(this.obj_elem.text_azim, '');

		var range = dom.input('range', 'range_azim', cont_val);
		range.setAttribute('min', 0);
		range.setAttribute('value', 0);
		range.setAttribute('step', 1);
		this.obj_elem.range = range;

		this.hiddenPanel()


		range.addEventListener('input', this.changeIndex.bind(this))

		btn_prev.addEventListener('click',function(){
			self.prevAngle();
		});
		btn_next.addEventListener('click',function(){
			self.nextAngle();
		});

		function createElemInfo(itm , text){
			var elem = dom.elem('div', 'info '+itm ,cont_info );
			var name = dom.div('name', elem );
			dom.text(name, text ? text : itm);
			var val = dom.div('val', elem );
			
			return val
		};

		this.createInfoFooter();

	};

	

	this.createInfoFooter = function(){
		var par = main.ui.viewport;
		var elem = dom.div('info_footer', par);
		var elem_programs = dom.div("link_program", elem);
		var name_programs = dom.div('name', elem_programs)
		dom.text(name_programs, 'About the program:');
		var val_programs = dom.div('val', elem_programs);
		var link = dom.a('http://ies.sharakshane.com/', 'link', val_programs );
		dom.text(link, 'http://ies.sharakshane.com/')

		var elem_author = dom.div('list_author', elem);
		var name_link = dom.div('name', elem_author);
		dom.text(name_link, 'Authors:');
		var val_author = dom.div('val', elem_author);
		var autor_0 = dom.div('itm_author', val_author);
		dom.html(autor_0, 'Anton Sharakshane,  Ph.D., Kotel&rsquo;nikov Institute of Radio-engineering and Electronics of Russian Academy of Sciences, anton.sharakshane@gmail.com, CV ' )
		var autor_1 = dom.div('itm_author', val_author);
		dom.html(autor_1, 'Sergey Gnedoy, gnedoy@gmail.com');
	};

	this.createPopup = function(cont, cont_info){

		var btn_edit = dom.div('btn_openEdit', cont_info)
		var btn_down = dom.div('btn_down', cont_info)
		dom.visible(btn_down, false)

		dom.on('click', btn_down, this.prepareFiles.bind(this))


		this.obj_elem.btn_edit = btn_edit;
		this.obj_elem.btn_down = btn_down

		dom.display(this.obj_elem.btn_edit, false);

		dom.on('click', btn_edit, this.showPopup.bind(this));

		var popup = dom.div('popup', cont);

		var content = dom.div('content', popup);
		var itm_popup = dom.div('itm_popup', content);
		var body = dom.div('body', itm_popup);
		var cont_btn = dom.div('cont_btn', itm_popup);

		var btn_save = dom.div('btn save', cont_btn);
		dom.text(btn_save, 'save');

		var btn_cancel = dom.div('btn cancel', cont_btn);
		dom.text(btn_cancel, 'cancel');

		dom.on('click', btn_cancel , this.hidePopup.bind(this))

		dom.on('click', btn_save, this.saveInfo.bind(this))

		var par = body

		var obj_test = itmElem('test');
		var obj_data = itmElem('data');
		var obj_manufac = itmElem('manufac');
		var obj_lumcat = itmElem('lumcat');
		var obj_luminaire = itmElem('luminaire');
		var obj_lampcat = itmElem('lampcat');
		var obj_lamp = itmElem('lamp');
		var obj_other = itmElem('other');
		// var obj_light_flow = itmElem('light_flow');

		// var obj_polar = itmElem('polar');
		// var obj_azim = itmElem('azim');
		// var obj_power = itmElem('power');

		this.obj_elem.popup = {};
		this.obj_elem.popup.elem = popup;
		this.obj_elem.popup.content = body;

		this.obj_elem.popup.test = obj_test;
		this.obj_elem.popup.data = obj_data;
		this.obj_elem.popup.manufac = obj_manufac;
		this.obj_elem.popup.lumcat = obj_lumcat;
		this.obj_elem.popup.luminaire = obj_luminaire;
		this.obj_elem.popup.lampcat = obj_lampcat
		this.obj_elem.popup.lamp = obj_lamp;
		this.obj_elem.popup.other = obj_other;
		// this.obj_elem.popup.light_flow = obj_light_flow;

		function itmElem(val, text){
			var elem = dom.elem('div', 'itm' ,par);
			var name = dom.elem('div', 'name', elem);
			var cont_val = dom.elem('div', 'val', elem);
			var input = dom.input('text', '', cont_val)
			dom.text(name, text ? text : val);
			input.setAttribute('name', val);

			return input
		}

	};

	this.prepareFiles = function(){

		var text = this.getNewInfoFile()
		this.downloadFiles(text)
	};
	this.getNewInfoFile = function(){

		var arr = ['iesna', 'test', 'data', 'manufac', 'lumcat', 'luminaire', 'lampcat', 'lamp', 'other', 'more', 'tilt']

		var data = main.info_ies.info_data
		var arr_data = [];
		for(var i = 0; i < arr.length; i++){
			var key = arr[i];
			if(!data[key] || (key == 'data' && data['date'])) continue
			if(key == 'iesna') {
				str = ['IESNA:LM-63-', data[key]].join('')
			} else if(key != 'tilt'){
				str = ['['+key.toUpperCase()+']', data[key]].join(' ');
			} else {
				str = [ key.toUpperCase(), data[key]].join('=');
			}
			arr_data.push(str);
		}

		for(var key in data){
			if(key == 'line' || key == 'light_flow' || key == 'power' || key == 'azim' || key == 'polar') continue
			if(arr.indexOf(key) >= 0) continue
			var str = '';
			
			if(key == 'iesna') {
				str = ['IESNA:LM-63-', data[key]].join('')
			} else if(key != 'tilt'){
				str = ['['+key.toUpperCase()+']', data[key]].join(' ');
			} else {
				str = [ key.toUpperCase(), data[key]].join('=');
			}
			arr_data.splice(-2, 0, str);
		}
		arr_data.push(data.line[0].join(' '))
		arr_data.push(data.line[1].join(' '))

		arr_data.push(main.info_ies.polar.arr.join(' '))
		arr_data.push(main.info_ies.azim.arr.join(' '))
		var str_data = this.getArrayData();
		arr_data.push(str_data)
		var data_sould = arr_data.join('\n')
		return data_sould
	};

	this.getArrayData = function(){
		var len_polar = main.info_ies.polar.arr.length;
		var len_azim = main.info_ies.azim.arr.length;
		var arr_data = [];
		var minR = main.info_ies.minR;
		var maxR = main.info_ies.maxR;
		var diff = maxR - minR;

		var lines = main.info_ies.lines;
		for(var a = 0; a < len_azim; a++){
			arr_data[a] = [];
			for(var p = 0; p < len_polar; p++){	
				var num = lines[p][a]*maxR
				var arr_num = (''+num).split('.')
				if(arr_num[1] && arr_num[1].length > 4){
					var fix = parseFloat(arr_num[1].substr(0, 4))
					if(fix){
						if((10000 - fix) > 1){
							num = num.toFixed(4);
						} else {
							num = Math.ceil(num);
						}
					} else {
						num = Math.floor(num);
					}
				}

				arr_data[a][p] = num;
			}
			arr_data[a] = arr_data[a].join(' ');
		}
		return arr_data.join('\n')
	};

	this.downloadFiles = function(text){
		var file_name = main.ui.dataInput.input.files.length ? main.ui.dataInput.input.files[0].name :  main.ui.dataInput.demo_file;
		// console.log(file_name)
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', 'new '+ file_name);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);

	}

	this.openEditPopup = function(){
		var data = main.info_ies.info_data
		var elem_popup = this.obj_elem.popup;
		var par = this.obj_elem.popup.content;

		elem_popup.test.value = data.test ? data.test : '';
		if(data.test){
			main.info_ies.info_data.test = elem_popup.test.value;
		}

		var time = data.date || data.data;
		elem_popup.data.value = time ? time : '' ;
		if(data.date) {
			main.info_ies.info_data.date = elem_popup.data.value;
		} else if(data.data) {
			main.info_ies.info_data.data = elem_popup.data.value;
		}

		elem_popup.manufac.value = data.manufac ? data.manufac : '';
		if(data.manufac){
			main.info_ies.info_data.manufac = elem_popup.manufac.value
		}
		elem_popup.lumcat.value = data.lumcat ? data.lumcat : '';
		if(data.lumcat){
			main.info_ies.info_data.lumcat = elem_popup.lumcat.value
		}

		elem_popup.luminaire.value = data.luminaire ? data.luminaire : '';
		if(data.luminaire){
			main.info_ies.info_data.luminaire = elem_popup.luminaire.value
		}


		elem_popup.lampcat.value = data.lampcat ? data.lampcat : '';
		if(data.lampcat){
			main.info_ies.info_data.lampcat = elem_popup.lampcat.value;
		}


		elem_popup.lamp.value = data.lamp ? data.lamp : '';
		if(data.lamp){
			main.info_ies.info_data.lamp = elem_popup.lamp.value
		}

		elem_popup.other.value = data.other ? data.other : '';
		if(data.other){
			main.info_ies.info_data.other = elem_popup.other.value
		}

		// elem_popup.light_flow.value = data.light_flow ? data.light_flow : '';
		// if(data.light_flow) {
		// 	main.info_ies.info_data.light_flow = elem_popup.light_flow.value
		// }

		// var obj_polar = itmElem();
		// dom.text(obj_polar.name, 'polar');
		// obj_polar.input.value = data.polar ? data.polar : '';
		
		// var obj_azim = itmElem();
		// dom.text(obj_azim.name, 'azim');
		// obj_azim.input.value = data.azim ? data.azim : '';
		
		// var obj_power = itmElem();
		// dom.text(obj_power.name, 'power');
		// obj_power.input.value = data.power ? data.power : '';

		
	};

	this.saveInfo = function(){

		var data = main.info_ies.info_data;
		var elem_popup = this.obj_elem.popup;

		var test = elem_popup.test.value;
		var time = elem_popup.data.value;
		var manufac = elem_popup.manufac.value;
		var lumcat = elem_popup.lumcat.value;
		var luminaire = elem_popup.luminaire.value;
		var lampcat = elem_popup.lampcat.value;
		var lamp = elem_popup.lamp.value;
		var other = elem_popup.other.value;
		

		var save = false;
		var obj = this.obj_elem;

		if(this.checkVal(data.test, test)) {
			console.log('test')
			save = true
			main.info_ies.info_data.test = test
			dom.text(obj.test, test );
		}

		if(this.checkVal(data.date, time)){
			save = true
			main.info_ies.info_data.date = time 
			dom.text(obj.data, time)
		} else if(this.checkVal(data.data, time)){
			save = true
			main.info_ies.info_data.data = time 
			dom.text(obj.data, time)
		}

		if(this.checkVal(data.manufac, manufac)){
			console.log('manufac', true)
			save = true;
			main.info_ies.info_data.manufac = manufac;
			dom.text(obj.manufac, manufac);
		}
		
		if(this.checkVal(data.lumcat, lumcat)) {
			console.log('lumcat', true)
			save = true
			main.info_ies.info_data.lumcat = lumcat
			dom.text(obj.lumcat, lumcat)
		}

		if(this.checkVal(data.luminaire, luminaire)) {
			console.log('luminaire')
			save = true
			main.info_ies.info_data.luminaire = luminaire
			dom.text(obj.luminaire, luminaire)
		}

		if(this.checkVal(data.lampcat, lampcat)){
			save = true
			main.info_ies.info_data.lampcat = lampcat
			dom.text(obj.lampcat, lampcat)
		}

		if(this.checkVal(data.lamp, lamp)) {
			console.log('lamp')
			save = true
			main.info_ies.info_data.lamp = lamp
			dom.text(obj.lamp, lamp)
		}
		if(this.checkVal(data.other, other)) {
			console.log('other')
			save = true
			main.info_ies.info_data.other = other
			dom.text(obj.other, other)
		}
		// if(parseFloat(light_flow) != data.light_flow) {
		// 	save = true
		// 	console.log('light_flow')
		// }

		console.log('save', save)

		if(save) {
			dom.visible(this.obj_elem.btn_down, true)
		}

		this.closePopup()
	}

	this.checkVal = function(obj, val){
		var test = false;
		var ts = /\w/;
		var test_val = ts.test(val);
		var test_obj = obj ? ts.test(obj) : false;

		if(obj){
			if((!test_obj && test_val) || 
				(test_obj && !test_val) || 
				(test_obj && test_val && obj != val)) {
				test = true;
			}
		} else if(test_val){
			test = true
		}
		return test
	}

	this.showPopup = function(){
		if(!main.info_ies.info_data) return
		this.visPopupEdit = true
		dom.display(this.obj_elem.popup.elem, true);
		this.openEditPopup()
	};

	this.hidePopup = function(){
		this.visPopupEdit = false
		this.closePopup();
		// dom.display(this.obj_elem.popup.elem, false);
	};

	this.prevAngle = function(){
		if(index - 1 < 0) return
		index -= 1;

		this.obj_elem.range.value = index
		this.setViewAzim();
	};
	this.nextAngle = function(){

		if(index+1 >= max_val+1) return 

		index += 1;
		this.obj_elem.range.value = index
		this.setViewAzim();
	};
	this.changeIndex = function(){
		index = parseFloat(this.obj_elem.range.value)
		this.setViewAzim();
	};
	this.setViewAzim = function(){

		var val = this.obj_elem.range.value
		index = Math.floor(parseFloat(val));
		main.builder.index_line = index;
		main.view_azim.updateViewAzim(index);


		if(main.builder.lineRoot && main.builder.meshRoot){
			main.builder.updateMaterial();
		}

		var left = Math.floor(-(val*30 + 15) +5) + (157/max_val)*val + 5;

		this.obj_elem.elem_list_val.style.marginLeft = left +'px';

		this.viewToGraph();

	};

	this.openPopup = function(){

	};
	this.closePopup = function(){
		var elem_popup = this.obj_elem.popup;

		elem_popup.test.value = '';
		elem_popup.data.value = '';
		elem_popup.manufac.value = '';
		elem_popup.lumcat.value = '';
		elem_popup.luminaire.value = '';
		elem_popup.lampcat.value = '';
		elem_popup.lamp.value = '';
		elem_popup.other.value = '';

		dom.display(this.obj_elem.popup.elem, false);
	}
	
	this.updateInfo = function(){
		var data = main.info_ies.info_data
		var obj = this.obj_elem

		dom.visible(this.obj_elem.btn_down, false)

		if(!data) {
			dom.display(this.obj_elem.cont_info, false)
			dom.display(this.obj_elem.btn_edit, false)
		} else {
			dom.display(this.obj_elem.cont_info, true)
			dom.display(this.obj_elem.btn_edit, true)

			dom.text(obj.test, data.test );
			dom.text(obj.data, data.date || data.data );
			dom.text(obj.manufac, data.manufac );
			dom.text(obj.lumcat, data.lumcat );
			dom.text(obj.luminaire, data.luminaire );
			dom.text(obj.lampcat, data.lampcat );
			dom.text(obj.lamp, data.lamp );
			dom.text(obj.other, data.other );
			dom.text(obj.light_flow, data.light_flow );
			dom.text(obj.polar, data.polar)
			dom.text(obj.azim, data.azim)
			dom.text(obj.power, data.power )
		}

		var len = main.info_ies.lines[0] ? main.info_ies.lines[0].length : 0;
		max_val = main.info_ies.azim.arr.length -1//len

		var index_of = main.info_ies.azim.arr.indexOf(0);
		index = index_of >= 0 ? index_of : 0;
		this.obj_elem.range.value = index;
		this.setViewAzim()

		if(max_val <= 1) {
			var text = main.info_ies.azim.arr.length > 0 ? 'Axial symmetry' : '';
			dom.text(this.obj_elem.text_azim, text);

			this.hiddenPanel();
		} else {
			this.showPanel();
			dom.text(this.obj_elem.text_azim, '');

			var ind_0 = main.info_ies.azim.arr.indexOf(0);
			if(ind_0 >= 0){
				main.view_azim.addViewAzim(ind_0, '#ff0000');
			}

			var ind_1 = main.info_ies.azim.arr.indexOf(90);
			if(ind_1 >= 0){
				main.view_azim.addViewAzim(ind_1, '#0000ff');
			}
		}
	};

	this.hiddenPanel = function(){
		dom.visible(this.obj_elem.btn_prev, false);
		dom.visible(this.obj_elem.btn_next, false);
		dom.visible(this.obj_elem.elem_list_val, false)

		dom.display(this.obj_elem.range, false);
	};
	this.showPanel = function(){
		dom.visible(this.obj_elem.btn_prev, true);
		dom.visible(this.obj_elem.btn_next, true);
		dom.visible(this.obj_elem.elem_list_val, true)

		this.obj_elem.range.setAttribute('max', max_val);

		main.view_azim.updateViewAzim(index);
		var text = main.info_ies.azim.arr[index];
		dom.text(this.obj_elem.text_azim, text);
		this.obj_elem.range.value = index;
		// this.setViewAzim()
		this.updateListVal()

		dom.display(this.obj_elem.range, true)
	};
	this.removeAllVal = function(){
		var elem_list = this.obj_elem.elem_list_val;
		this.obj_elem.list_val = [];

		while (elem_list.firstChild) {
			elem_list.removeChild(elem_list.firstChild);
		}
	};

	this.updateListVal = function(){
		var arr = main.info_ies.azim.arr;
		var elem_list = this.obj_elem.elem_list_val;
		this.obj_elem.list_val = [];
		this.removeAllVal();
		elem_list.style.width = (arr.length*30) + 'px';

		for(var i = 0; i < arr.length; i++){
			var elem = dom.elem('div', 'itm', elem_list)
			dom.text(elem, arr[i]);
			this.obj_elem.list_val.push(elem);
		}
	}
	this.viewToGraph = function(){

		var ind_0 = main.info_ies.azim.arr.indexOf(0);
		if(ind_0 >= 0){
			main.view_azim.addViewAzim(ind_0, '#ff0000');
		}

		var ind_1 = main.info_ies.azim.arr.indexOf(90);
		if(ind_1 >= 0){
			main.view_azim.addViewAzim(ind_1, '#0000ff');
		}

	};
	this.init()

}