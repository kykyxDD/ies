function ViewInfoIES(){
	var self = this
	//var parent = main.ui.viewport
	this.obj_elem = {};
	var index = 0;
	var max_val = 0

	this.init = function(){
		var cont = dom.elem('div', 'info_ies', main.ui.viewport)
		this.obj_elem.parent = cont;

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

		var cont_vis_azim = dom.elem('div', 'vis_azim', cont);
		var cont_btn = dom.elem('div', 'cont_switch', cont_vis_azim);
		var btn_prev = dom.elem('div', 'angle prev_angle', cont_btn);
		var icon_btn_prev = dom.elem('div', 'icon', btn_prev);
		var text_vis = dom.elem('div', 'val', cont_btn);
		var btn_next = dom.elem('div', 'angle next_angle', cont_btn);
		var icon_btn_next = dom.elem('div', 'icon', btn_next);
		var cont_view = dom.elem('div', 'cont_view', cont_vis_azim) ;
		this.obj_elem.text_azim = text_vis;
		this.obj_elem.btn_prev = btn_prev
		this.obj_elem.btn_next = btn_next
		main.view_azim.init(cont_view);
		dom.text(this.obj_elem.text_azim, '0');

		btn_prev.addEventListener('click',function(){
			self.prevAngle();
		});
		btn_next.addEventListener('click',function(){
			self.nextAngle();
		});

	};
	this.prevAngle = function(){
		// console.log('btn_prev');
		index = index - 1;
		index = index < 0 ? max_val + index : index;

		main.view_azim.updateViewAzim(index);
		dom.text(this.obj_elem.text_azim, (index+1)+'/'+max_val);
	};
	this.nextAngle = function(){
		// console.log('btn_next');
		index = index + 1;
		index = index%max_val;
		main.view_azim.updateViewAzim(index);
		dom.text(this.obj_elem.text_azim, (index+1)+'/'+max_val);
	};
	
	this.updateInfo = function(){

		if(!main.info_ies) {
			dom.visible(this.obj_elem.cont_info, false)
		} else {
			dom.visible(this.obj_elem.cont_info, true)

			dom.text(this.obj_elem.iesna, main.info_ies.iesna );
			dom.text(this.obj_elem.test, main.info_ies.test );
			dom.text(this.obj_elem.date, main.info_ies.date );
			dom.text(this.obj_elem.manufac, main.info_ies.manufac );
			dom.text(this.obj_elem.lumcat, main.info_ies.lumcat );
			dom.text(this.obj_elem.luminaire, main.info_ies.luminaire );
			dom.text(this.obj_elem.lamp, main.info_ies.lamp );
			
		}
		index = 0
		var len = main.info_ies.lines[0].length
		max_val = Math.ceil(main.info_ies.lines[0].length/2);
		if(max_val <= 1) {
			dom.visible(this.obj_elem.btn_prev, false)
			dom.visible(this.obj_elem.btn_next, false)
		} else {
			dom.visible(this.obj_elem.btn_prev, true)
			dom.visible(this.obj_elem.btn_next, true)
		}
		// console.log(max_val)
		dom.text(this.obj_elem.text_azim, (index+1)+'/'+max_val);
		main.view_azim.updateViewAzim(index);
	}
	this.init()
	
}