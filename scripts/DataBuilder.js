function DataBuilder() {
	this.lineMaterial = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors
	})

	this.meshMaterial = new THREE.MeshBasicMaterial({
		vertexColors: THREE.VertexColors
	})
	// console.log('cont', main.ui.viewport)
	var cont = dom.elem('div', 'cont_preload', main.ui.viewport)
	var popup = dom.elem('div', 'popup', cont)
	var preload = dom.elem('div', 'preload', popup)
	var percent = dom.elem('div', 'percent', preload)
	this.cont_preload = cont
	this.preload = percent
	this.index_line = 0;

}

DataBuilder.prototype = {

	heights: 6,
	verticals: 2,
	subdivisions: 64,

	colorK: -0.7,
	colorA: -0.3,
	showPreload: function(){
		//dom.text(this.preload, '0%');
		this.preload.style.width = '0%';
		dom.addclass(this.cont_preload, 'show');
	},

	buildFromSource: function(text) {
		// var lines = this.parseText(text)
		this.showPreload()
		var lines;
		main.info_ies = {
			
		};
		if(text.indexOf('IESNA')>=0){
			lines = this.parseTextIES(text);

		} else {
			lines = this.parseText(text);
			// main.info_ies = false;
		}
		main.info_ies.lines = lines;

		this.subdivisions = Math.ceil(64/lines[0].length);
		var linesCount = lines.length;
		var data = [];

		var planesCount = lines.length ? lines[0].length : 0
		var totalCount = planesCount * (this.subdivisions +1)

		var minR =  Infinity,
			maxR = -Infinity

		for(var i = 0; i < lines.length; i++) {
			var row = lines[i]

			for(var j = 0; j < row.length; j++) {
				var r = row[j]

				if(minR > r) minR = r
				if(maxR < r) maxR = r
			}
		}
		this.verticals = Math.ceil(180/lines.length);

		var normalR = 1 / maxR
		for(var i = 0; i < lines.length; i++) {
			var row = lines[i]

			for(var j = 0; j < row.length; j++) {
				row[j] *= normalR
			}
		}

		for(var i = 0; i < totalCount; i++) {
			data.push([])
		}

		var linesInterpolated = []
		for(var i = 0; i < lines.length -1; i++) {
			var a = i ? lines[i - 1] : lines[0],
			    b = lines[i],
			    c = i + 1 < linesCount ? lines[i+1] : b,
			    d = i + 2 < linesCount ? lines[i+2] : c

			for(var j = 0; j < this.verticals; j++) {
				var p = j / this.verticals
				var row = []

				for(var k = 0; k < a.length; k++) {
					row.push(this.cubicInterpolate(p, a[k], b[k], c[k], d[k]))
				}

				linesInterpolated.push(row)
			}
		}

		linesInterpolated.push(lines[linesCount -1]);

		linesCount = (linesCount - 1) * this.verticals + 1;
		lines = linesInterpolated;

		var minY =  Infinity,
			maxY = -Infinity;
		
		var finish_angle = Math.PI/2;
		if(main.info_ies && main.info_ies.polar){
			var start_angle = (main.info_ies.polar.max/360)* (2*Math.PI) - Math.PI;
			finish_angle = start_angle + Math.PI;
		}

		var start_azim = (Math.PI*2)*(parseFloat(main.info_ies.azim.arr[0])/360);

		for(var i = 0; i < linesCount; i++) {
			var row = lines[i]

			for(var j = row.length -1; j >= 0; j--) {
				var a = row[j],
				    b = row[(j+1)%row.length]

				for(var k = this.subdivisions -1; k >= 0; k--) {
					var p = k / this.subdivisions

					row.splice(j + 1, 0, (b - a) * p + a)
				}
			}

			for(var j = 0; j < row.length; j++) {
				var a =   finish_angle * i/linesCount - Math.PI/2
				,   b = (2*Math.PI   * j/totalCount + start_azim)%(Math.PI*2)

				var r = row[j],
				    x2 = r * Math.cos(a),
				    y2 = r * Math.sin(a)

				var x3 = x2 * Math.cos(b),
				    y3 = y2,
				    z3 = x2 * Math.sin(b)

				if(minY > y3) minY = y3
				if(maxY < y3) maxY = y3

				data[j].push(new THREE.Vector3(x3, y3, z3))
			}
		}
		main.info_ies.minR = minR;
		main.info_ies.maxR = maxR;

		main.info_ies.minY = minY;
		main.info_ies.maxY = maxY;

		main.info_ies.data = data;
		main.view_info_ies.updateInfo();


		var height = maxY - minY

		var root     = new THREE.Object3D
		,   lineRoot = new THREE.Object3D
		,   meshRoot = new THREE.Object3D
		,   lradRoot = new THREE.Object3D
		this.lineRoot = lineRoot
		this.meshRoot = meshRoot
		this.root = root

		var planesCount = data.length
		this.planesCount = planesCount
		var index = 0;
		var self = this;
		this.data = data
		this.index = 0;
		this.height = height
		
		
		/*
		for(var i = 0; i < planesCount; i++) {
			var j = (i+1) % planesCount

			if(i % (this.subdivisions +1) === 0) {
				lineRoot.add(this.createPlane(data[i], height))
			}
			meshRoot.add(this.createMesh(data[i], data[j], height))
		}*/



		
		return this.loadFigure()
	},
	showProgress: function (){
		var percent = Math.floor((this.index/this.planesCount)*100) +'%';
;
		this.preload.style.width = percent;
	},
	loadFigure: function (){
		this.showProgress();
		var i = this.index

		if(this.planesCount) {
			var j = (i+1) % this.planesCount
			var data_i = this.data[i];
			var data_j = this.data[j];

			if(i % (this.subdivisions +1) === 0) {
				this.lineRoot.add(this.createPlane(data_i, this.height))
			}
			this.meshRoot.add(this.createMesh(data_i, data_j, this.height))

		}

		this.index++;

		if(i < this.planesCount-1){
			return setTimeout(this.loadFigure.bind(this),0)
		} else {			
			return this.completeFigure()
		}
	},

	completeFigure: function (){
		var radiusCount = this.heights +1 || 1
		// for(var k = 1; k < radiusCount; k++) {
		// 	lradRoot.add(this.createRadius(k / radiusCount, data, minY, maxY))
		// }

		this.root.add(this.lineRoot)
		this.root.add(this.meshRoot)
		// root.add(lradRoot)

		var s = 1.002
		this.lineRoot.scale.set(s, s, s)
		// lradRoot.scale.set(s, s, s)
		var obj = {
			object: this.root,
			lineRoot: this.lineRoot,
			meshRoot: this.meshRoot
		}

		main.view.setTree(obj)
		onMaterial()
		main.view.toCenter()
		dom.remclass(this.cont_preload, 'show');
		var child = this.lineRoot.children[this.index_line];
		// console.log('child', child.material.wrapRGB)
		// child.material.color.r = 1
		// child.material.needsUpdate = true

		return {
			object: this.root,
			lineRoot: this.lineRoot,
			meshRoot: this.meshRoot
		}
	},

	radiusToVector: function(radius, index, height) {

	},

	vectorToRadius: function(vector) {

	},

	cubicInterpolate: function(x, a, b, c, d) {
		return b + 0.5 * x*(c - a + x*(2*a - 5*b + 4*c - d + x*(3*(b - c) + d - a)))
	},

	getColor: function(v, color) {
		if(!color) color = new THREE.Color

		var x = Math.sqrt(v.x * v.x + v.z * v.z)
		,   a = Math.atan2(v.y, x)
		,   r = x / Math.cos(a)

		var c = f.softcolor(r * this.colorK + this.colorA)

		color.r = c[0]
		color.g = c[1]
		color.b = c[2]

		return color
	},

	createRadius: function(k, data, minY, maxY) {
		var vertices = []
		var colors = []

		var h = k * (maxY - minY) + minY
		for(var i = 0; i < data.length; i++) {
			var col = data[i]

			for(var j = 0; j < col.length -1; j++) {
				var a = col[j]
				var b = col[j+1]

				if(b.y < h) continue

				var k = (h - a.y) / (b.y - a.y)
				var v = new THREE.Vector3(
					(b.x - a.x) * k + a.x,
					(b.y - a.y) * k + a.y,
					(b.z - a.z) * k + a.z)

				this.getColor(v).toArray(colors, i * 3)
				vertices.push(v.x, v.y, v.z)

				break
			}
		}
		vertices.push(vertices[0], vertices[1], vertices[2])
		colors.push(colors[0], colors[1], colors[2])
		// var j = Math.floor(k * data[0].length)
		// for(var i = 0; i < data.length; i++) {
		// 	var v = data[i][j]

		// 	color.toArray(colors, i * 3)
		// 	vertices.push(v.x, v.y, v.z)
		// }
		// var v = data[0][j]
		// color.toArray(colors, i * 3)
		// vertices.push(v.x, v.y, v.z)

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color',    new THREE.Float32Attribute(colors, 3))

		return new THREE.Line(geometry, this.lineMaterial)
	},
	updateMaterial: function(){
		var color = main.linesOnly ? 0xffffff : 0x000000;
		var vertexColors = main.linesOnly ? THREE.VertexColors : 0
		var visible = main.linesVisible
		var vis_linesOnly

		var index_asim = (Math.ceil(this.lineRoot.children.length/2) + this.index_line)%this.lineRoot.children.length;
		for(var l = 0; l < this.lineRoot.children.length; l++){
			var line = this.lineRoot.children[l];
			if(l != this.index_line && l != index_asim){
				line.material.color.set(color);
			} else {
				line.material.color.set(0xff0000);
			}
			
			line.material.vertexColors = vertexColors;//main.linesOnly ? THREE.VertexColors : 0
			line.material.visible = visible;
			line.material.needsUpdate = true
		}
		for(var m = 0; m < this.meshRoot.children.length; m++){
			var mesh = this.meshRoot.children[m];
			mesh.material.visible = !main.linesOnly
		}

		main.view.needsRedraw = true

	},

	createPlane: function(data, height) {
		var vertices = []
		,   colors   = []

		var lines = data.length
		,   color = new THREE.Color(0xffffff)
		for(var i = 0; i < lines; i++) {
			var v = data[i]

			vertices.push(v.x, v.y, v.z)

			this.getColor(v, color)
			color.toArray(colors, i * 3)
		}

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color', new THREE.Float32Attribute(colors, 3))
		var mater_0 = new THREE.LineBasicMaterial({
			vertexColors: THREE.VertexColors
		})
		var mater_1 = this.lineMaterial

		return new THREE.Line(geometry, mater_0)//this.lineMaterial)
	},

	createMesh: function(left, right, height) {
		var geometry = new THREE.Geometry

		var lines = left.length
		for(var i = 0; i < lines -1; i++) {
			var j = i + 1

			var a = left [i]
			,   b = left [j]
			,   c = right[i]
			,   d = right[j]

			var cA = this.getColor(a)
			,   cB = this.getColor(b)
			,   cC = this.getColor(c)
			,   cD = this.getColor(d)

			var vi = geometry.vertices.length
			var fA = new THREE.Face3(vi +2, vi +0, vi +3, null, [cC, cA, cD])
			,   fB = new THREE.Face3(vi +0, vi +1, vi +3, null, [cA, cB, cD])

			geometry.vertices.push(a, b, c, d)
			geometry.faces.push(fA, fB)
		}


		return new THREE.Mesh(geometry, this.meshMaterial)
	},

	parseText: function(text) {
		var lines = text.replace(/,/g, '.').trim().split('\n')

		return lines.map(function(line) { return line.split(';').map(parseFloat) })

		/*for(var i = 0; i < cols; i++) data.push([])

		for(var i = 0; i < rows; i++) {
			var line = lines[i].split(';').map(parseFloat)

			if(line.length !== cols) {
				throw Error('DataBuilder: invalid columns number at line '+ i +': '+ lines[i])
			}

			for(var j = 0; j < cols; j++) {
				var a =   Math.PI/2 * i/rows - Math.PI/2
				,   b = 2*Math.PI   * j/cols

				var r  = line[j]
				,   x2 = r * Math.cos(a)
				,   y2 = r * Math.sin(a)


				var x3 = x2 * Math.cos(b)
				,   y3 = y2
				,   z3 = x2 * Math.sin(b)

				data[j].push(new THREE.Vector3(x3, y3, z3))
			}
		}

		return data*/
	},
	parseTextIES: function(text){
		var ts = /\w/
		var lines = text.replace(/,/g, '.').trim().split('\n');
		for(var l = 0; l < lines.length; l++){
			if(!ts.test(lines[l])){
				lines.splice(l,1)
				--l
			}
		}
		var index_last_s = 0;
		var info = {
			azim: {
				min : 0,
				arr : [0],
				max : 0
			},
			polar : {
				min : 0,
				arr : [0],
				max : 0
			},
			info_data: false
		}
		var info_data = {};
		//lines.map(function(line){
		for(var i = 0; i < lines.length; i++){
			var line = lines[i];
			var arr_1 = line.split(':');
			var arr_2 = line.split(']');
			var key = false;
			var val = false
			 if(arr_2.length > 1){
				var arr_3 = arr_2[0].split('[');

				val = arr_2.slice(1).join(':');
				if(arr_2.length > 1 && arr_3.length >= 1){
					if(arr_3[0] == ''){
						key = arr_3[1];
					} else {
						key = arr_3[0];
					}
				}

				index_last_s = i;
			} else if(arr_1.length > 1) {
				key = arr_1[0];
				val = arr_1.length == 2 ? arr_1[1] : arr_1.slice(1).join(':')
			} else if(line.indexOf('TILT=') >= 0){
				var arr = line.split('=');
				key = 'TILT';
				val = arr.length == 2 ? arr[1] : arr_1.slice(1).join('=')

				index_last_s = i;

			}
			if(key && val){
				info_data[key.toLowerCase()] = val
			}
		}
		main.info_ies.info_data = info_data;
		var data = lines.slice(index_last_s+1)
		var index_zero = [];
		if(!data[0]) return [];
		var arr_info = this.delStr(data[0].split(' '))
		var arr_info_1 = this.delStr(data[1].split(' '))
		var num_polar = parseFloat(arr_info[3]);
		var num_azim = parseFloat(arr_info[4]);
		main.info_ies.info_data.light_flow = parseFloat(arr_info[1]);
		main.info_ies.info_data.polar = num_polar;
		main.info_ies.info_data.azim = num_azim;
		main.info_ies.info_data.power = parseFloat(arr_info_1[2]);
		var arr_angle = []

		for(var i = 2; i < data.length;i++){
			var arr = data[i].replace(/\t/g, ' ').split(' ');
			arr = this.delStr(arr);
			arr_angle = arr_angle.concat(arr);
		}
		var arr_polar_angle = arr_angle.splice(0, num_polar)
		var arr_azim_angle = arr_angle.splice(0, num_azim)
		var arr_data = [];

		for(var i = 0; i < num_azim; i++){
			arr_data.push(arr_angle.splice(0, num_polar))
		}

		main.info_ies.lines_1 = arr_data;
		return this.getArrData(arr_polar_angle, arr_azim_angle, arr_data)
	},
	getArrData: function(polar, azim, coor){
		var arr_data = [];
		var first_angle_azim = parseFloat(azim[0]);
		var last_angle_azim = parseFloat(azim[azim.length-1]);
		var sum_azim = last_angle_azim + (360 - first_angle_azim)%360;

		var first_angle_polar = parseFloat(polar[0]);
		var last_angle_polar = parseFloat(polar[polar.length-1]);
		var sum_polar = last_angle_polar + (360 - first_angle_polar)%360;
		

		for(var i = 0; i < azim.length; i++){
			azim[i] = parseFloat(azim[i])
		}
		for(var i = 0; i < polar.length; i++){
			polar[i] = parseFloat(polar[i])
		}

		main.info_ies.azim = {
			min: first_angle_azim,
			arr: azim,
			max: last_angle_azim,
			sum: sum_azim
		}
		main.info_ies.polar = {
			min: first_angle_polar,
			arr: polar,
			max: last_angle_polar,
			sum: sum_polar
		}

		for(var i = 0; i < polar.length; i++){
			arr_data[i] = [];
			for(var j = 0; j < azim.length; j++){
				arr_data[i][j] = parseFloat(coor[j][i])
			}
		}

		if(sum_azim > 0 && sum_azim < 360){
			var path = Math.floor(360/sum_azim);
			for(var i = 0; i < arr_data.length; i++){
				var item_arr_str = arr_data[i];
				
				var new_arr = [];
				if(path%2 == 0){
					var rever_arr = arr_data[i].slice().reverse();
					var new_path = arr_data[i].slice().concat(rever_arr);
					for(var p = 0; p < path/2; p++){
						new_arr = new_arr.concat(new_path)
					}
				} else {
					for(var p = 0; p < path; p++){
						new_arr = new_arr.concat(item_arr_str)
					}
				}

				arr_data[i] = new_arr
			}
		}
	
		return arr_data
	},
	delStr: function(arr){
		for(var i = 0; i < arr.length; i++){
			var num = !isNaN(parseFloat(arr[i]))

			if(!num){
				arr.splice(i,1)
				--i
			}
		}
		return arr
	}
}
