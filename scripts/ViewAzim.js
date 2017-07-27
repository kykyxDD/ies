function ViewAzim(){
	var stage, container, cont_axis, global_cont;
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

		global_cont = new createjs.Container();
		global_cont.x = canvas.width/2;
		global_cont.y = canvas.height/2;

		cont_axis = new createjs.Container();
		global_cont.addChild(cont_axis);

		container = new createjs.Container();
		container.x = 0; //canvas.width/2;
		container.y = 0; //canvas.height/2;
		global_cont.addChild(container)

		stage.addChild(global_cont)
		var draw_lines = this.drawLines();

		stage.update();
	};

	this.clearAllContainer = function(){
		this.arrData = [];
		container.removeAllChildren();
		cont_axis.removeAllChildren();
		stage.update();
	}

	this.loadNewFigure = function(index_zero, index_perp){
		// console.log('load');
		this.arrData = [];
		this.clearAllContainer();
		var shape = new createjs.Shape();
		cont_axis.addChild(shape);
		var data = this.getCoor(index_zero.itm, index_zero.sim)
		this.arrData.push({data:data, color: '#ff0000'});
		var draw_figure = this.drawLine(data, shape, '#ff0000'); //this.drawFigure(data, '#ff0000');
		// console.log('zero_data',index_zero.data)
		// console.log('perp_data',index_perp.data)


		if(index_perp.itm != undefined && index_perp.sim != undefined){
			var data = this.getCoor(index_perp.itm, index_perp.sim)
			this.arrData.push({data:data, color: '#0000ff'});
			var draw_figure = this.drawLine(data, shape, '#0000ff'); //this.drawFigure(data, '#0000ff');
		}
		

		stage.update();
	}
	this.updateViewAzim = function(index, index_sim){

		container.removeAllChildren();

		this.arrData[2] = false;
		var zero = main.builder.index_zero;
		var perp = main.builder.index_perp;
		if(main.info_ies.azim.arr.length >= 1 ){

			if((index != zero.itm && index != zero.sim) &&
			(index != perp.itm && index != perp.sim) && 
			(index_sim != zero.itm && index_sim != zero.sim) &&
			(index_sim != perp.itm && index_sim != perp.sim)){
				var data = this.getCoor(index, index_sim);
				this.arrData[2] = {data:data, color: '#00ff00'};
				var draw_figure = this.drawFigure(data);
			} else {
				if((index != zero.sim && index_sim != zero.itm) &&
				   (index != perp.sim && index_sim != perp.itm)){
					if((index == zero.itm && index != zero.sim) ||
					   (index != zero.itm && index == zero.sim) ||
					   (index == perp.itm && index != perp.sim) || 
					   (index != perp.itm && index == perp.sim)){
						index = undefined
					} 
					if((index_sim != zero.itm && index_sim == zero.sim) ||
					   (index_sim == zero.itm && index_sim != zero.sim) ||
					   (index_sim != perp.itm && index_sim == perp.sim) ||
					   (index_sim == perp.itm && index_sim != perp.sim)){
						index_sim = undefined
					}
				}

				if(index >= 0 || index_sim >= 0){
					var data = this.getCoor(index, index_sim);
					this.arrData[2] = {data:data, color: '#00ff00'};
					var draw_figure = this.drawFigure(data);
				}
			}
			
		}

		stage.update();
	};
	this.addViewAzim = function(index, color ){
		var data = this.getCoor(index);
		this.arrData.push({data:data, color: color});
		var draw_figure = this.drawFigure(data, color);

		stage.update();
	};

	this.getCoor = function(index, index_sim){
		// console.log('getCoor',index,index_sim);
		var data = [[],[]];
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
		if(index >= 0){
			for(var i = 0; i < linesCount; i++) {
				data[0].push(lines[i][index])
			}
		}
		if(main.info_ies.azim.sum >= 180){
			var new_index
			if(index_sim >=0){
				new_index = index_sim%planesCount;
			} else {
				new_index = (Math.floor(planesCount/2) + index)%(planesCount)	
			}
			index_sim = new_index

			for(var i = 0; i < linesCount; i++) {
				var row = lines[i]

				data[1].push(lines[i][new_index])
			}
		} else {
			if(index >= 0){
				for(var i =  0; i < linesCount; i++) {
					var row = lines[i];
					data[1].push(row[index])
				}
			}
		}

		var verticals = main.builder.verticals;
		var cubicInterpolate = main.builder.cubicInterpolate
		for(var k = 0; k < data.length; k++){
			var new_arr = [];
			for(var i = 0; i < data[k].length; i++){
				var a = i ? data[k][i - 1] : data[k][0],
					b = data[k][i],
					c = i + 1 < linesCount ? data[k][i+1] : b,
					d = i + 2 < linesCount ? data[k][i+2] : c
				var row = [];
				for(var j = 0; j < verticals; j++) {
					var p = j / verticals;

					var num = cubicInterpolate(p, a, b, c, d);
					new_arr.push(num)
				}

			}
			data[k] = new_arr
		}

		for(var k = 0; k < data.length;k++){
			var len = data[k].length;
			if(k == 0){
				
				for(var i = 0; i < len; i++){
					var a = finish_angle * i/len - Math.PI/2;

					var r_0 = data[k][i],
						x = r_0 * Math.cos(a),
						y = r_0 * Math.sin(a);

					data[k][i] = new THREE.Vector2(x, y)
				}
			} else {
				for(var i = len - 1; i >= 0 ; i--) {

					var a = finish_angle * i/len - Math.PI/2;

					var r_0 = data[k][i],
						x = -r_0 * Math.cos(a),
						y =  r_0 * Math.sin(a)
					data[k][i] = new THREE.Vector2(x, y)
				}
			}
		}


		return data[0].concat(data[1].reverse())
	};
	this.drawLines = function(){
		var shape = new createjs.Shape();

		var graphics = this.drawGrid(shape);
		global_cont.addChild(shape)
		stage.update();
	};
	this.drawGrid = function(shape, size){
		var g = shape.graphics;
		g.setStrokeStyle(0.1);
		var s = size ? size : 100;

		var max_size_r = Math.max(Math.abs(minR), Math.abs(maxR));
		
		g.beginStroke( '#000000' );
		for(var i = 1; i < 15; i++){			
			g.arc(0,0,(s/5)*i, 0, Math.PI*2)
		}
		for(var i = 1; i < 18; i++){
			var a = Math.PI*(i/18);
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
		// console.log('arrData',this.arrData)
		var clone_canvas = dom.elem('canvas', '', false);
		// canvas.id = 'canvas_azim';
		clone_canvas.width = 2000;
		clone_canvas.height = 2000;
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
		var graphics = this.drawGrid(shape, clone_canvas.width/2);
		cont.addChild(shape)
		
		var shape_1 = new createjs.Shape();
		cont.addChild(shape_1);

		for(var i = 0 ; i < this.arrData.length; i++){
			var itm = this.arrData[i];
			if(itm && itm.data && itm && itm.data.length){
				this.drawLine(itm.data, shape_1, itm.color)
			}
		}

		s.update();

		var format_image = "image/jpeg";
		var format = "jpg";
		var file_name = '';
		if(main.builder.viewFigure){
			//file_name = main.ui.dataInput.input.files.length ? main.ui.dataInput.input.files[0].name :  main.ui.dataInput.demo_file;
			file_name = main.ui.dataInput.itm_file_name ? main.ui.dataInput.itm_file_name :  main.ui.dataInput.demo_file;
			file_name = file_name.substr(0, file_name.length-4);
		}

		var a = document.createElement('a');
		a.href = clone_canvas.toDataURL(format_image);
		a.download = 'thumbnail ' +file_name+'.' + format;
		a.click();

	};
}