function ViewAzim(){
	var stage,container;
	var canvas = dom.elem('canvas', 'canvas_azim', false);
	canvas.id = 'canvas_azim';
	canvas.width = 200;
	canvas.height = 200;
	this.arrData = [];

	var minR = 0,
		maxR = 0,
		minY = 0,
		maxY = 0,
		r = 0
	canvas.style.backgroundColor = 'rgb(255,255,255)';

	this.init = function(cont){
		dom.append(cont, canvas)
		stage = new createjs.Stage(canvas);

		var btn = dom.div('save_canvas', cont)
		dom.text(btn, 'DOWNLOAD');

		dom.on('click',btn, this.downCanvas.bind(this));

		container = new createjs.Container();
		container.x = canvas.width/2;
		container.y = canvas.height/2;

		stage.addChild(container)
		var draw_lines = this.drawLines();

		stage.update();
	};
	this.updateViewAzim = function(index){
		container.removeAllChildren();

		this.arrData = [];
		var draw_lines = this.drawLines();
		var zero = main.builder.index_zero;
		var perp = main.builder.index_perp;
		if(main.info_ies.azim.arr.length >= 1 && 
			(index != zero.itm && index != zero.sim) &&
			(index != perp.itm && index != perp.sim)){
			var data = this.getCoor(index);
			this.arrData.push({data:data, color: '#00ff00'});
			var draw_figure = this.drawFigure(data);
		}

		stage.update();
	};
	this.addViewAzim = function(index, color ){
		var data = this.getCoor(index);
		this.arrData.push({data:data, color: color});
		var draw_figure = this.drawFigure(data, color);

		stage.update();
	};

	this.getCoor = function(index){
		var data = [];
		var lines = main.info_ies.lines;

		var planesCount = lines[0] ? lines[0].length : 0;
		var totalCount = planesCount;
		var linesCount = lines.length;
		
		var finish_angle = Math.PI/2;
		if(main.info_ies && main.info_ies.polar){
			var start_angle = (main.info_ies.polar.sum/360)* (2*Math.PI) - Math.PI;
			finish_angle = start_angle + Math.PI;
		}
		var start_azim = (Math.PI*2)*(parseFloat(main.info_ies.azim.arr[0])/360);
		for(var i = 0; i < linesCount; i++) {
			var row = lines[i];

			var a = finish_angle * i/linesCount - Math.PI/2,
				b = (2*Math.PI   * index/totalCount + start_azim)%(Math.PI*2);

			var r_0 = row[index],
				x = r_0 * Math.cos(a),
				y = r_0 * Math.sin(a);

			data.push(new THREE.Vector2(x, y))
		}
		if(main.info_ies.azim.sum >= 180){
			var new_index = (Math.floor(planesCount/2) + index)%(planesCount)
			for(var i = linesCount-1; i >= 0 ; i--) {
				var row = lines[i]

				var a = finish_angle * i/linesCount - Math.PI/2,
				    b = (2*Math.PI   * new_index/totalCount + start_azim)%(Math.PI*2)//2*Math.PI   * new_index/totalCount

				var r_0 = row[new_index],
					x = -r_0 * Math.cos(a),
					y =  r_0 * Math.sin(a);

				data.push(new THREE.Vector2(x, y))
			}
		} else {

			for(var i = linesCount-1; i >= 0 ; i--) {
				var row = lines[i];

				var a = finish_angle * i/linesCount - Math.PI/2,
					b = (2*Math.PI   * index/totalCount + start_azim)%(Math.PI*2)

				var r_0 = row[index],
					x = -r_0 * Math.cos(a),
					y =  r_0 * Math.sin(a)

				data.push(new THREE.Vector2(x, y))
			}
		}

		return data
	};
	this.drawLines = function(){
		var shape = new createjs.Shape();

		var graphics = this.drawGrid(shape);
		container.addChild(shape)
		stage.update();
	};
	this.drawGrid = function(shape, size){
		var g = shape.graphics;
		g.setStrokeStyle(0.1);
		var s = size ? size : 100;

		var max_size_r = Math.max(Math.abs(minR), Math.abs(maxR));
		
		g.beginStroke( '#000000' );
		for(var i = 1; i < 15; i++){			
			g.arc(0,0,(s/10)*i, 0, Math.PI*2)
		}
		for(var i = 1; i < 10; i++){
			var a = Math.PI*(i/10);
			g.moveTo(-s*1.5*Math.cos(a),  s*1.5*Math.sin(a));
			g.lineTo( s*1.5*Math.cos(a), -s*1.5*Math.sin(a));
			
		}
		
		g.moveTo( -s, 0 );
		g.lineTo( s, 0 );

		g.moveTo( 0, -s );
		g.lineTo( 0, s );

		g.endStroke();

		this.createTextAngle(shape);
		return g
	};
	this.createTextAngle = function(shape){
		var text = new createjs.Text("Hello World", "20px Arial", "#ff7700");
 		text.x = 100;

	};
	this.drawFigure = function(data, color){
		var shape = new createjs.Shape();
		container.addChild(shape)
		var graphics = this.drawLine(data, shape, color);
		stage.update();
	}
	this.drawLine = function(data, shape, color){
		var r = (shape.stage.canvas.width/2)*0.9;
		shape.alpha = 0.3;
		var line = shape.graphics;
		line.beginStroke( color ? color : '#00ff00' );
		line.beginFill("#fefe8a");

		for(var i = 0; i < data.length; i++){
			if(i == 0) {
				line.moveTo( data[0].x*r, data[0].y*-r )
			} else {
				line.lineTo( (data[i].x*r), (data[i].y*-r) );
			}
		}
		line.endFill();
		line.endStroke();
		stage.update();
		return line
	};
	this.downCanvas = function(){
		console.log('arrData',this.arrData)
		var clone_canvas = dom.elem('canvas', '', false);
		// canvas.id = 'canvas_azim';
		clone_canvas.width = 600;
		clone_canvas.height = 600;
		clone_canvas.style.backgroundColor = '#ffffff';

		var s = new createjs.Stage(clone_canvas);

		var btn = dom.div('save_canvas', cont)
		dom.text(btn, 'DOWNLOAD');

		dom.on('click',btn, this.downCanvas.bind(this));

		var cont = new createjs.Container();
		cont.x = clone_canvas.width/2;
		cont.y = clone_canvas.height/2;

		s.addChild(cont)
		var shape = new createjs.Shape();
		shape.graphics.beginFill('#ffffff').drawRect(clone_canvas.width/2, clone_canvas.height/2, clone_canvas.width, clone_canvas.height)
		var graphics = this.drawGrid(shape, 300);
		cont.addChild(shape)
		
		var shape_1 = new createjs.Shape();
		cont.addChild(shape_1);

		for(var i = 0 ; i < this.arrData.length; i++){
			var itm = this.arrData[i];
			this.drawLine(itm.data, shape_1, itm.color)
		}

		s.update();

		var format_image = "image/jpeg";
		var format = "jpg";

		var file_name = main.ui.dataInput.input.files.length ? main.ui.dataInput.input.files[0].name :  main.ui.dataInput.demo_file;
		file_name = file_name.substr(0, file_name.length-4);

		var a = document.createElement('a');
		a.href = clone_canvas.toDataURL(format_image);
		a.download = 'thumbnails ' +file_name+'.' + format;
		a.click();

	};
}