function ViewInfoIES(){
	var self = this
	//var parent = main.ui.viewport
	this.obj_elem = {};
	var index = 0;
	var max_val = 0

	this.init = function(){
		var cont = dom.elem('div', 'info_ies', main.ui.viewport)
		this.obj_elem.parent = cont;
		var logo = dom.elem('div', 'logo', main.ui.viewport)

		var cont_info = dom.elem('div', 'cont_info', cont);
		this.obj_elem.cont_info = cont_info;
		var iesna = dom.elem('div', 'info iesna' ,cont_info );
		var elem_name_iesna = dom.elem('div', 'name', iesna );
		dom.text(elem_name_iesna, 'IESNA');
		var elem_val_iesna = dom.elem('div', 'val', iesna );
		this.obj_elem.iesna = elem_val_iesna;

		var test = dom.elem('div', 'info test' ,cont_info );
		var elem_name_test = dom.elem('div', 'name', test );
		dom.text(elem_name_test, 'TEST');
		var elem_val_test = dom.elem('div', 'val', test );
		this.obj_elem.test = elem_val_test;

		var date = dom.elem('div', 'info date' ,cont_info );
		var elem_name_date = dom.elem('div', 'name', date );
		dom.text(elem_name_date, 'DATE');
		var elem_val_date = dom.elem('div', 'val', date );
		this.obj_elem.date = elem_val_date;

		var manufac = dom.elem('div', 'info manufac' ,cont_info );
		var elem_name_manufac = dom.elem('div', 'name', manufac );
		dom.text(elem_name_manufac, 'MANUFAC');
		var elem_val_manufac = dom.elem('div', 'val', manufac );
		this.obj_elem.manufac = elem_val_manufac;



		var lumcat = dom.elem('div', 'info lumcat' ,cont_info );
		var elem_name_lumcat = dom.elem('div', 'name', lumcat );
		dom.text(elem_name_lumcat, 'LUMCAT');
		var elem_val_lumcat = dom.elem('div', 'val', lumcat );
		this.obj_elem.lumcat = elem_val_lumcat;

		var luminaire = dom.elem('div', 'info luminaire' ,cont_info );
		var elem_name_luminaire = dom.elem('div', 'name', luminaire );
		dom.text(elem_name_luminaire, 'LUMINAIRE');
		var elem_val_luminaire = dom.elem('div', 'val', luminaire );
		this.obj_elem.luminaire = elem_val_luminaire;

		var lamp = dom.elem('div', 'info lamp' ,cont_info );
		var elem_name_lamp = dom.elem('div', 'name', lamp );
		dom.text(elem_name_lamp, 'LAMP');
		var elem_val_lamp = dom.elem('div', 'val', lamp );
		this.obj_elem.lamp = elem_val_lamp;


		var other = dom.elem('div', 'info other' ,cont_info );
		var elem_name_other = dom.elem('div', 'name', other );
		dom.text(elem_name_other, 'OTHER');
		var elem_val_other = dom.elem('div', 'val', other );
		this.obj_elem.other = elem_val_other;

		var light_flow = dom.elem('div', 'info light_flow' ,cont_info );
		var elem_name_light_flow = dom.elem('div', 'name', light_flow );
		dom.text(elem_name_light_flow, 'Световой поток');
		var elem_val_light_flow = dom.elem('div', 'val', light_flow );
		this.obj_elem.light_flow = elem_val_light_flow;

		var cont_vis_azim = dom.elem('div', 'vis_azim', cont);
		var cont_btn = dom.elem('div', 'cont_switch', cont_vis_azim);
		var btn_prev = dom.elem('div', 'angle prev_angle', cont_btn);
		var icon_btn_prev = dom.elem('div', 'icon', btn_prev);
		var cont_val = dom.elem('div', 'cont_val', cont_btn);
		var text_vis = dom.elem('div', 'val', cont_val);
		var btn_next = dom.elem('div', 'angle next_angle', cont_btn);
		var icon_btn_next = dom.elem('div', 'icon', btn_next);
		var cont_view = dom.elem('div', 'cont_view', cont_vis_azim) ;
		this.obj_elem.text_azim = text_vis;
		this.obj_elem.btn_prev = btn_prev
		this.obj_elem.btn_next = btn_next
		main.view_azim.init(cont_view);
		dom.text(this.obj_elem.text_azim, '0');

		var range = dom.input('range', 'range_azim', cont_val);
		range.setAttribute('min', 0);
		range.setAttribute('value', 0);
		range.setAttribute('step', 1);
		this.obj_elem.range = range;

		this.hiddenPanel()

/*		range.addEventListener('input', function(){
			console.log('change', this.value)
		});*/

		range.addEventListener('input', this.changeIndex.bind(this))

		btn_prev.addEventListener('click',function(){
			self.prevAngle();
		});
		btn_next.addEventListener('click',function(){
			self.nextAngle();
		});

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
		main.view_azim.updateViewAzim(index);

		var text = main.info_ies.azim.arr[index]; //(index+1)+'/'+max_val
		dom.text(this.obj_elem.text_azim, text);
		this.viewToGraph();
	};
	
	
	this.updateInfo = function(){
		var data = main.info_ies.info_data

		if(!data) {
			dom.visible(this.obj_elem.cont_info, false)
		} else {
			dom.visible(this.obj_elem.cont_info, true)

			dom.text(this.obj_elem.iesna, data.iesna );
			dom.text(this.obj_elem.test, data.test );
			dom.text(this.obj_elem.date, data.date || data.data );
			dom.text(this.obj_elem.manufac, data.manufac );
			dom.text(this.obj_elem.lumcat, data.lumcat );
			dom.text(this.obj_elem.luminaire, data.luminaire );
			dom.text(this.obj_elem.lamp, data.lamp );
			dom.text(this.obj_elem.other, data.other );
			dom.text(this.obj_elem.light_flow, data.light_flow );
			
		}
		index = 0

		var len = main.info_ies.lines[0] ? main.info_ies.lines[0].length : 0;
		max_val = main.info_ies.azim.arr.length -1//len
		var step = 0;
		main.view_azim.updateViewAzim(index);

		if(max_val <= 1) {
			var text = main.info_ies.azim.arr.length > 0 ? 'Axial symmetry' : '';
			dom.text(this.obj_elem.text_azim, text);

			this.hiddenPanel();
		} else {
			this.showPanel();

			var ind = main.info_ies.azim.arr.indexOf(90);
			if(ind >= 0){
				main.view_azim.addViewAzim(ind);
			}			
		}
		
		
	};
	this.hiddenPanel = function(){
		dom.visible(this.obj_elem.btn_prev, false);
		dom.visible(this.obj_elem.btn_next, false);
		
		dom.display(this.obj_elem.range, false);
	};
	this.showPanel = function(){
		dom.visible(this.obj_elem.btn_prev, true)
		dom.visible(this.obj_elem.btn_next, true)
		

		this.obj_elem.range.setAttribute('max', max_val);
		var index_of = main.info_ies.azim.arr.indexOf(0);
		index = index_of >= 0 ? index_of : 0;
		var text = main.info_ies.azim.arr[index]; //(index+1)+'/'+max_val
		dom.text(this.obj_elem.text_azim, text);
		this.obj_elem.range.setAttribute('value', index);
		this.setViewAzim()
		
		dom.display(this.obj_elem.range, true)
	};
	this.viewToGraph = function(){
		if(main.info_ies.azim.arr[index] == 0){
			var ind = main.info_ies.azim.arr.indexOf(90);
			if(ind >= 0){
				main.view_azim.addViewAzim(ind);
			}
		}
	};
	this.init()
	
}