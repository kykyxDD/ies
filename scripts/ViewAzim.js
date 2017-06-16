function ViewAzim(){
	var stage,container;
	var canvas = dom.elem('canvas', 'canvas_azim', false);
	canvas.id = 'canvas_azim';
	canvas.width = 200;
	canvas.height = 200;

	var minR = 0,
		maxR = 0,
		minY = 0,
		maxY = 0,
		r = 0
	canvas.style.backgroundColor = 'rgb(255,255,255)';


	this.init = function(cont){
		// console.log('ViewAzim',cont)
		dom.append(cont, canvas)
		stage = new createjs.Stage(canvas);

		var circle = new createjs.Shape();
		circle.graphics.beginFill("red").drawCircle(0, 0, 50);
		circle.x = 75;
		circle.y = 75;
		// stage.addChild(circle);

		container = new createjs.Container();
		container.x = canvas.width/2;
		container.y = canvas.height/2;

		stage.addChild(container)

		stage.update();
	};
	this.updateViewAzim = function(index){
		// console.log('updateViewAzim')
		container.removeAllChildren()


		minR = main.info_ies.minR
		maxR = main.info_ies.maxR
		minY = main.info_ies.minY
		maxY = main.info_ies.maxY
		var max_r = Math.max(Math.abs(minR), Math.abs(maxR))
		var max_y = Math.max(Math.abs(minY), Math.abs(maxY))
		r = Math.max(max_r, max_y)
		// console.log(r)
		

		var data = this.getCoor(index);
		// var data = this.getCoor1(index)
		var draw_lines = this.drawLines();
		var draw_figure = this.drawFigure(data);

		
		var scale = 1 ; 
		if(r > canvas.height/2){
			scale = ((canvas.height/2)-10)/r
		} else if(r < canvas.height/4){
			scale = ((canvas.height/2))/r
		}

		container.scaleX = container.scaleY = scale;

		stage.update();

	};
	this.getCoor1 = function(index) {
		var data = main.info_ies.data;
		var arr = [];
		for(var i = 0; i< data.length; i++){
			arr.push(data[i][index])
		}
		return arr
	}
	this.getCoor = function(index){
		var data = []//main.info_ies.data;
		var lines = main.info_ies.lines
		/*for(var i = 0; i < main.info_ies.lines.length; i++){
			//arr.push(main.info_ies.lines[i][index])
		}
		console.log('arr',arr)*/
		var planesCount = lines[0].length
		var totalCount = planesCount;

		var linesCount = lines.length;
		
		var finish_angle = Math.PI/2;
		if(main.info_ies && main.info_ies.polar){
			var start_angle = (main.info_ies.polar.max/360)* (2*Math.PI) - Math.PI;
			finish_angle = start_angle + Math.PI;
		}
		for(var i = 0; i < linesCount; i++) {
			var row = lines[i]

			//for(var j = 0; j < row.length; j++) {
			var a =   finish_angle * i/linesCount - Math.PI/2
			,   b = 2*Math.PI   * index/totalCount

			var r = row[index]
			,   x2 = r * Math.cos(a)
			,   y2 = r * Math.sin(a)

			var x3 = -x2//* Math.cos(b)
			,   y3 = y2
			,   z3 = 0//x2* Math.sin(b)



			data.push(new THREE.Vector3(x3, y3, z3))
		}
		if(main.info_ies.azim.max >= 180){
			var new_index = (Math.floor(planesCount/2) + index)%(planesCount)
			for(var i = linesCount-1; i >= 0 ; i--) {
				var row = lines[i]

				//for(var j = 0; j < row.length; j++) {
				var a =   finish_angle * i/linesCount - Math.PI/2
				,   b = 2*Math.PI   * new_index/totalCount

				var r = row[new_index]
				,   x2 = r * Math.cos(a)
				,   y2 = r * Math.sin(a)

				var x3 = x2 //* Math.cos(b)
				,   y3 = y2
				,   z3 = 0//x2 * Math.sin(b)



				data.push(new THREE.Vector3(x3, y3, z3))
			}
		} else {
			for(var i = linesCount-1; i >= 0 ; i--) {
				var row = lines[i]

				//for(var j = 0; j < row.length; j++) {
				var a =   finish_angle * i/linesCount - Math.PI/2
				,   b = 2*Math.PI   * index/totalCount

				var r = row[index]
				,   x2 = r * Math.cos(a)
				,   y2 = r * Math.sin(a)

				var x3 = x2//* Math.cos(b)
				,   y3 = y2
				,   z3 = 0//x2* Math.sin(b)



				data.push(new THREE.Vector3(x3, y3, z3))
			}
		}
		// console.log(data)
		return data
	};
	this.drawLines = function(){
		var shape = new createjs.Shape();

		var graphics = this.drawGrid(shape);
		container.addChild(shape)
		stage.update();
	};
	this.drawGrid = function(shape){
		var g = shape.graphics;//new createjs.Graphics();
		g.setStrokeStyle(0.1);

		var max_size_r = Math.max(Math.abs(minR), Math.abs(maxR));
		
		g.beginStroke( '#000000' );
		for(var i = 1; i < 15; i++){
			
			g.arc(0,0,10*i, 0, Math.PI*2)

		}
		for(var i = 1; i < 10; i++){
			var a = Math.PI*(i/10);
			g.moveTo(-150*Math.cos(a),  150*Math.sin(a));
			g.lineTo( 150*Math.cos(a), -150*Math.sin(a));
			
		}
		
		g.moveTo( -100, 0 );
		g.lineTo( 100, 0 );

		g.moveTo( 0, -100 );
		g.lineTo( 0, 100 );

		g.endStroke();


		this.createTextAngle(shape);
		return g
	};
	this.createTextAngle = function(shape){
		var text = new createjs.Text("Hello World", "20px Arial", "#ff7700");
 		text.x = 100;

	};
	this.drawFigure = function(data){
		var shape = new createjs.Shape();
		var graphics = this.drawLine(data, shape);

		container.addChild(shape)
		stage.update();
	}
	this.drawLine = function(data, shape){
		r = 50

		var line = shape.graphics
		line.beginStroke( '#FF0000' );
		

		for(var i = 0; i < data.length; i++){
			if(i == 0) {
				line.moveTo( data[0].x*r, data[0].y*-r )
			} else {
				line.lineTo( (data[i].x*r), (data[i].y*-r) );
			}
			
		}


		line.endStroke();
		return line
	}
}