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
	charset: 'utf-8', 
	file_sum: 'sum.ies',
	unitName: 'UI_DataInput',
	ename: 'ui-data-input',

	demo_file: '2113.IES',//'8663.IES',
	itm_file_name: this.demo_file,
	text_span: 'Upload *.ies File',
	text_drod: 'Drag and drop *.ies file or',

	create: function() {
		var self = this;

		this.arrList = [];

		var cont_list_file = dom.div('list_file', this.element);
		var list_file = dom.div('cont_list_file', cont_list_file);
		this.list_file = list_file;

		var cont_btn_sum = dom.div('cont_btn_sum', cont_list_file);
		dom.display(cont_btn_sum, false);
		this.cont_btn_sum = cont_btn_sum;

		var btn_calc_sum = dom.div('calc_sum', cont_btn_sum);
		btn_calc_sum.innerHTML = 'calculate summary';


		dom.on('click', btn_calc_sum, function(){
			self.createIESSum()
		});

		var btn_ies_sum = dom.div('ies_sum', cont_btn_sum);
		var text_ies_sum =  dom.div('text_sum', btn_ies_sum);
		text_ies_sum.innerHTML = 'calculate summary';
		var close_sum = dom.div('del', btn_ies_sum);

		dom.on('click', text_ies_sum, function(){
			if(!self.check_sum){
				self.prevFileList();
				self.check_sum = true
				self.changeFileList(self.data_sum)
				dom.addclass(self.cont_btn_sum, 'change');
			}
		});

		dom.on('click',close_sum, function(){
			
			self.creatDataSum()
		});

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
	creatDataSum: function(){

		var check_sum = this.check_sum;

		dom.remclass(this.cont_btn_sum, 'sum');
		this.itm_edit = false;
		this.data_sum = false;
		this.check_sum = false;

		if( dom.hasclass(this.cont_btn_sum, 'change')){
			this.changeFileList(this.arrList[0])
			dom.remclass(this.cont_btn_sum, 'change')
		}
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
		this.itm_edit = false

		this.prevFileList();
		var elem = dom.div('itm change', this.list_file);
		var name = dom.div('name', elem)

		var span = dom.elem('span', "text", name)
		span.innerHTML = txt;

		if(span.offsetWidth > name.offsetWidth - 20){
			var text = span.innerHTML.substr(0, span.innerHTML.length-4)
			span.innerHTML = text+'...';
			while(span.offsetWidth > name.offsetWidth - 20){
				var text = span.innerHTML.substr(0, span.innerHTML.length-4)
				span.innerHTML = text+'...';
			}
		}


		var btn_close = dom.div('del', elem);
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

		var has = dom.hasclass(obj.elem, 'change')
		this.list_file.removeChild(obj.elem);

		this.checkListFile()

		if(this.arrList.length){
			if(has){
				this.changeFileList(this.arrList[0]);
			}
		} else {
			main.view_azim.clearAllContainer();
			main.view_info_ies.destroy()
			this.itm_file = false;
			this.itm_file_name = false;
			this.input.value = '';
			main.view.setTree();
			main.view.toCenter();
		}
	},
	changeFileList: function (obj) {
		if(this.check_sum){
			this.saveDataSum()
		} else {
			this.prevFileList();
		}

		dom.addclass(obj.elem, 'change');
		var data = obj.data;
		this.itm_file_name = obj.name
		if(obj.data){
			this.itm_edit = obj.edit;
			onData(data)
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

			var info = main.initData.getInfo(main.info_ies);

			this.arrList[id].data = info.data;
			this.arrList[id].edit = info.edit;
		}
	},
	saveDataSum: function(){

		dom.remclass(this.cont_btn_sum, 'change');
		var info = main.initData.getInfo(main.info_ies);

		this.data_sum = {
			data: info.data,
			name: 'sum.ies',
			edit: true
		};

		this.check_sum = false
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
			dom.display(this.btn_load_demo, false);
		} else {
			dom.display(this.btn_load_demo, true);
		}

		if(this.max_files <= this.arrList.length){
			dom.addclass(this.dropzone, 'disabled');
		} else {
			dom.remclass(this.dropzone, 'disabled');
		}

		if(this.arrList.length > 1) {
			dom.display(this.cont_btn_sum, true)
		} else {
			dom.display(this.cont_btn_sum, false)
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

	createIESSum: function(){
		this.prevFileList();

		this.check_sum = true;

		this.itm_file_name = this.file_sum

		dom.addclass(this.cont_btn_sum, 'sum');
		dom.addclass(this.cont_btn_sum, 'change');
		this.itm_edit = true;
		var arr = [];

		for(var i = 0; i < this.arrList.length; i++){
			if(this.arrList[i].data){
				arr.push(this.arrList[i].data)
			}
		};

		if(arr.length){
			main.createDataSum.create(arr)
		};
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

		this.reader.readAsText(file, this.charset); // utf-8 cp1251
	},

	onLoad: function(e) {
		var data = this.reader.result;
		var ts = /[а-я]/i;

		if(this.charset == 'utf-8' && !ts.test(data)){
			this.charset = 'cp1251';

			
			this.onChange()
		} else {
			this.createBtnFile(this.itm_file.name)
			this.events.emit('data_input', data)
			this.charset = 'utf-8';
		}
	}
})
