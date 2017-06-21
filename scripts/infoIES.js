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
		dom.text(elem_name_light_flow, 'Light flow');
		var elem_val_light_flow = dom.elem('div', 'val', light_flow );
		this.obj_elem.light_flow = elem_val_light_flow;

		var power = dom.elem('div', 'info light_flow' ,cont_info );
		var elem_name_power = dom.elem('div', 'name', power );
		dom.text(elem_name_power, 'Power');
		var elem_val_power = dom.elem('div', 'val', power );
		this.obj_elem.power = elem_val_power;

		var polar = dom.elem('div', 'info light_flow' ,cont_info );
		var elem_name_polar = dom.elem('div', 'name', polar );
		dom.text(elem_name_polar, 'Number of polar angles');
		var elem_val_polar = dom.elem('div', 'val', polar );
		this.obj_elem.polar = elem_val_polar;

		var azim = dom.elem('div', 'info light_flow' ,cont_info );
		var elem_name_azim = dom.elem('div', 'name', azim );
		dom.text(elem_name_azim, 'Number of azimuth angles');
		var elem_val_azim = dom.elem('div', 'val', azim );
		this.obj_elem.azim = elem_val_azim;

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


		// this.createRange(cont_val)

		this.hiddenPanel()


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
		
		var val = this.obj_elem.range.value
		index = Math.floor(parseFloat(val));
		main.builder.index_line = index;
		main.view_azim.updateViewAzim(index);

		if(main.builder.lineRoot && main.builder.meshRoot){
			main.builder.updateMaterial()	
		}
		


		var left = Math.floor(-(val*30 + 15) +5) + (157/(max_val))*val + 5 // + (160/(max_val +1))*index ) + 5  

		this.obj_elem.elem_list_val.style.marginLeft = left +'px';

		var text = main.info_ies.azim.arr[index]; //(index+1)+'/'+max_val
		// dom.text(this.obj_elem.text_azim, text);
		this.viewToGraph();

		// main.builder.highlightLines(index)
	};
	
	
	this.updateInfo = function(){
		var data = main.info_ies.info_data
		var obj = this.obj_elem

		if(!data) {
			dom.visible(this.obj_elem.cont_info, false)
		} else {
			dom.visible(this.obj_elem.cont_info, true)

			dom.text(obj.iesna, data.iesna );
			dom.text(obj.test, data.test );
			dom.text(obj.date, data.date || data.data );
			dom.text(obj.manufac, data.manufac );
			dom.text(obj.lumcat, data.lumcat );
			dom.text(obj.luminaire, data.luminaire );
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
		// console.log('index',index)
		this.obj_elem.range.value = index;
		this.setViewAzim()

		if(max_val <= 1) {
			var text = main.info_ies.azim.arr.length > 0 ? 'Axial symmetry' : '';
			dom.text(this.obj_elem.text_azim, text);

			this.hiddenPanel();
		} else {
			this.showPanel();
			dom.text(this.obj_elem.text_azim, '');

			var ind = main.info_ies.azim.arr.indexOf(90);
			if(ind >= 0){
				main.view_azim.addViewAzim(ind);
			}			
		}
	};

	this.createRange = function(par){
		var self = this;
		this.mouse_down = false

		var elem = dom.elem('div', 'cont_range', par);

		var line = dom.elem('div','line',elem);
		var cont_slider = dom.elem('div','cont_slider',line);
		var slider_0 = dom.elem('div','slider left', cont_slider);
		var slider_1 = dom.elem('div','slider right', cont_slider);

		cont_slider.addEventListener('mousedown', function(){
			// console.log('mousedown')
			self.mouse_down = true;
		})
		var body = document.body;
		body.addEventListener('mousemove', function(){
			if(self.mouse_down) {

			}
		});

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
		// var index_of = main.info_ies.azim.arr.indexOf(0);
		// index = index_of >= 0 ? index_of : 0;
		main.view_azim.updateViewAzim(index);
		var text = main.info_ies.azim.arr[index]; //(index+1)+'/'+max_val
		dom.text(this.obj_elem.text_azim, text);
		this.obj_elem.range.value = index;
		// this.setViewAzim()
		this.updateListVal()
		
		dom.display(this.obj_elem.range, true)
	};
	this.removeAllVal = function(){
		var elem_list = this.obj_elem.elem_list_val;
		// var list = [];
		this.obj_elem.list_val = [];

		while (elem_list.firstChild) {
		    elem_list.removeChild(elem_list.firstChild);
		}
	};

	this.updateListVal = function(){
		var arr = main.info_ies.azim.arr;
		var elem_list = this.obj_elem.elem_list_val;
		// var list = [];
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
		if(main.info_ies.azim.arr[index] == 0){
			var ind = main.info_ies.azim.arr.indexOf(90);
			if(ind >= 0){
				main.view_azim.addViewAzim(ind);
			}
		}
	};
	this.init()
	
}