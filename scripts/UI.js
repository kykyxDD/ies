UI = f.unit(Block, {
	unitName: 'UI',
	ename: 'ui',

	create: function() {
		this.header   = dom.div('header',   this.element)
		this.viewport = dom.div('viewport', this.element)
		this.footer   = dom.div('footer',   this.element)

		this.dataInput = new UI.DataInput({
			events: this.events,
			eroot: this.viewport
		})
	},

	onblur: function() {
		UI.Submenu.closeAll(null)
	},

	onresize: function() {

	},

	update: function() {

	}
})


UI.DataInput = f.unit(Block, {
	max_files: 3,
	itm_edit: false,
	charset: 'utf-8' , 
	unitName: 'UI_DataInput',
	ename: 'ui-data-input',

	demo_file: '2113.IES',//'8663.IES',
	itm_file_name: this.demo_file,
	text_span: 'Upload *.ies File',
	text_drod: 'Drag and drop *.ies file or',

	create: function() {

		this.arrList = []

		var cont_list_file = dom.div('list_file', this.element)
		this.list_file = cont_list_file;

		var btn_load_demo = dom.elem('span', 'load_demo', this.element)
		dom.text(btn_load_demo, 'Load Demo File');
		this.btn_load_demo = btn_load_demo

		dom.on('click', btn_load_demo, this.loadStartFile.bind(this));

		this.createDragDrop();
	},
	createDragDrop: function(){
		var self = this;

		var elem = dom.div("dropzone", this.element);//'<div class="dropzone" id="dropzone">Перетащите файлы сюда</div>';
		elem.id = "dropzone";
		var span = dom.elem('span', 'text_dropzone', elem)
		dom.text(span, this.text_drod);
		this.dropzone_text = span;
		this.dropzone = elem;
		var elem_0 = dom.div('', this.element);
		elem_0.id = "upload_overall";

		var label = dom.elem('label', 'label_file_input', elem);
		this.label = label;


		var span = dom.elem('span', 'span_input', label)
		span.innerHTML = this.text_span;
		this.span = span;
		this.input  = dom.input('file', 'file-input', label);
		this.reader = new FileReader

		dom.on('change', this.input,   this);
		dom.on('load',   this.reader,  this);

		elem.addEventListener('dragenter', self.dropenter.bind(self));
		elem.addEventListener('dragover', self.dropenter.bind(self));
		elem.addEventListener('dragleave', self.dropleave.bind(self));
		elem.addEventListener('drop', function(e){
			e.stopPropagation();
			e.preventDefault();
			self.dodrop(e)
			return false;
		});
		
	},
	dodrop: function(e) {
		this.dropleave()
		dom.remclass(this.dropzone, 'hover')
		var dt = e.dataTransfer;
		if(!dt && !dt.files) { return false ; }

		var files = dt.files;

		dt.dropEffect="copy";

		for (var i = 0; i < files.length; i++) {
			this.ajax_upload(files[i]);
		}

		e.stopPropagation();
		e.preventDefault();
		return false;
	},

	// AJAX-загрузчик файлов
	ajax_upload: function(file) {
		if (window.XMLHttpRequest) {
			var http_request = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			try {
				http_request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					http_request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
		 			return false;
				}
			}
		} else {
			return false;
		}

		this.itm_file = file
		this.itm_file_name = file.name;
		var name = file.fileName || file.name;
		this.input.value = '';
		this.input.files[0] = file;
		this.onChange();
	},
	dropenter: function(e) {
		e.stopPropagation();
		e.preventDefault();

		this.dropzone.style.backgroundColor = '#E4E4E4';
		dom.text(this.dropzone_text, 'Drop your files here');
	},

	dropleave: function() {

		this.dropzone.style.backgroundColor='';
		dom.text(this.dropzone_text, this.text_drod);
	},
	xmlhttp: function(){
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	},
	createBtnFile: function(txt){
		// console.log('createBtnFile')
		this.itm_edit = false

		this.prevFileList();
		// console.log('prev', prev_change)
		var elem = dom.div('itm change', this.list_file);
		var name = dom.div('name', elem)
		name.innerHTML = txt;


		var btn_close = dom.div('del', elem);
		// btn_close.innerHTML = '&#10006;'
		var obj = {
			elem: elem,
			name: txt
		}
		this.arrList.push(obj)
		var self = this

		dom.on('click',name, function(){
			var id = self.arrList.indexOf(obj)
			if(id >= 0){
				self.changeFileList(self.arrList[id])
			}
		})
		dom.on('click',btn_close, function() {
			self.remFileList(self.arrList.indexOf(obj))
		});

		this.checkListFile()
	},
	remFileList: function(id){
		if(id == -1) return

		var obj = this.arrList.splice(id, 1)[0];
		this.list_file.removeChild(obj.elem);

		this.checkListFile()

		if(this.arrList.length){
			this.changeFileList(this.arrList[0]);
		} else {
			main.view_azim.clearAllContainer();
			main.view_info_ies.destroy()
			this.itm_file = false;
			this.itm_file_name = false;
			this.input.value = '';
		}
	},
	changeFileList: function (obj) {
		this.prevFileList();
		
		dom.addclass(obj.elem, 'change');
		var data = obj.data;
		this.itm_file_name = obj.name
		if(obj.data){
			// console.log('edit',obj.edit)
			this.itm_edit = obj.edit;
			onData(data)
			// dom.visible(main.view_info_ies.obj_elem.btn_down, obj.edit)
		}
	},

	prevFileList: function(){
		var id
		var prev_change = document.querySelector('.list_file .itm.change');
		if(prev_change) {
			dom.remclass(prev_change, 'change')
			var name = prev_change.querySelector('.name').innerHTML;
			for(var i = 0; i < this.arrList.length; i++){
				if(this.arrList[i].name == name){
					id = i
				}
			}
		}
		if(id >= 0){
			
			var info = main.view_info_ies.getInfo();
			
			this.arrList[id].data = info.data;
			this.arrList[id].edit = info.edit;
		}
	},
	checkListFile: function() {
		var res = false;

		for(var i = 0; i < this.arrList.length; i++){
			if(this.arrList[i].demo || this.arrList[i].name == this.demo_file){
				this.arrList[i].demo = true
				res = true
			}
		}
		if(res){
			dom.display(this.btn_load_demo, false)
		} else {
			dom.display(this.btn_load_demo, true)
		}

		if(this.max_files <= this.arrList.length){
			dom.addclass(this.dropzone, 'disabled')
			// console.log('disabled')
		} else {
			dom.remclass(this.dropzone, 'disabled')
			// console.log('no disabled')
		}
	},
	loadStartFile: function(){
		this.input.value = '';
		// this.span.innerHTML = this.text_span;
		var url = './data/'+this.demo_file;
		var xhr = this.xmlhttp();
		xhr.open("GET", url, true);
		var self = this;

		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200) {
				self.createBtnFile(self.demo_file)
				onData(this.responseText)
			}
		};
		xhr.send();
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'tap':
				this.onTap(e)
			break

			case 'change':
				this.onChange(e)
			break

			case 'load':
				this.onLoad(e)
			break
		}
	},

	onTap: function(e) {
		this.input.click()
	},

	onChange: function(e) {
		main.dataSource = false
		var file = this.input.files[0] || this.itm_file;

		if(!file) return
		this.itm_file = file;
		this.itm_file_name = file.name;
		// this.span.innerHTML = file.name;

		this.reader.readAsText(file, this.charset) // utf-8 cp1251
	},

	onLoad: function(e) {
		var data = this.reader.result;
		var ts = /[а-я]/i;

		if(this.charset == 'utf-8' && !ts.test(data)){
			this.charset = 'cp1251';

			this.createBtnFile(this.itm_file.name)
			this.onChange()
		} else {
			this.events.emit('data_input', data)
			this.charset = 'utf-8';
		}
	}
})
