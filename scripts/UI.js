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

	create: function() {
		this.input  = dom.input('file', 'file-input', this.element)
		this.reader = new FileReader

		dom.on('change', this.input,   this)
		dom.on('load',   this.reader,  this)
		// dom.on('tap',    this.element, this)
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

		this.reader.readAsText(file, 'cp1251')
	},

	onLoad: function(e) {
		var data = this.reader.result

		this.events.emit('data_input', data)
	}
})
