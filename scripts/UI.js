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
	unitName: 'UI_DataInput',
	ename: 'ui-data-input',
	demo_file: 'new.ies',
	text_span: 'Upload *.ies File',

	create: function() {

		var btn_load_demo = dom.elem('span', 'load_demo', this.element)
		dom.text(btn_load_demo, 'Load Demo File');

		dom.on('click', btn_load_demo, this.loadStartFile.bind(this));

		var label = dom.elem('label', 'label_file_input', this.element);
		this.label = label;


		var span = dom.elem('span', 'span_input', label)
		span.innerHTML = this.text_span;
		this.span = span;
		this.input  = dom.input('file', 'file-input', label);
		this.reader = new FileReader

		dom.on('change', this.input,   this)
		dom.on('load',   this.reader,  this)
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
				// console.log(this)
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
		var file = this.input.files[0]

		if(!file) return
		this.span.innerHTML = file.name;
		// console.log('file',file)

		this.reader.readAsText(file, 'cp1251')
	},

	onLoad: function(e) {
		var data = this.reader.result

		this.events.emit('data_input', data)
	}
})
