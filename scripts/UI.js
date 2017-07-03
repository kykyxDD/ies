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
	charset: 'utf-8' , 
	unitName: 'UI_DataInput',
	ename: 'ui-data-input',
	demo_file: '8663.IES',
	text_span: 'Upload *.ies File',
	text_drod: 'Drag and drop *.ies file or',

	create: function() {

		var btn_load_demo = dom.elem('span', 'load_demo', this.element)
		dom.text(btn_load_demo, 'Load Demo File');

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
		//console.log('dodrop')
		this.dropleave()
		dom.remclass(this.dropzone, 'hover')
		var dt = e.dataTransfer;
		if(!dt && !dt.files) { return false ; }

		// Получить список загружаемых файлов
		var files = dt.files;

		// Fix для Internet Explorer
		dt.dropEffect="copy";

		for (var i = 0; i < files.length; i++) {
			this.ajax_upload(files[i]);
		}

		// Подавить событие перетаскивания файла
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
		var name = file.fileName || file.name;
		this.input.files[0] = file;
		this.onChange();
	},
	dropenter: function(e) {
		e.stopPropagation();
		e.preventDefault();

		this.dropzone.style.backgroundColor='#E4E4E4';
		dom.text(this.dropzone_text, 'Drop your files here');
	},

	dropleave: function() {

		this.dropzone.style.backgroundColor='#BBBBBB';
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
	loadStartFile: function(){
		this.input.value = '';
		this.span.innerHTML = this.text_span;
		var url = './data/'+this.demo_file;
		var xhr = this.xmlhttp();
		xhr.open("GET", url, true);
		var self = this;

		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200) {
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
		var file = this.input.files[0];

		if(!file) return
		this.span.innerHTML = file.name;

		this.reader.readAsText(file, this.charset) // utf-8 cp1251
	},

	

	onLoad: function(e) {
		var data = this.reader.result;
		var ts = /[а-я]/i;

		if(this.charset == 'utf-8' && !ts.test(data)){
			this.charset = 'cp1251';
			this.onChange()
		} else {
			this.events.emit('data_input', data)
			this.charset = 'utf-8';
		}

		// this.events.emit('data_input', data)
	}
})
