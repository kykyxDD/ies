function DataBuilder() {

	this.viewFigure = false;
	this.max_azim_data = 90;

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
	this.index_zero = {
		itm: 0,
		sim: 0
	}; 
	this.index_perp = {
		itm: 0,
		sim: 0
	};  // перпендикуляр

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

	buildFromSource: function(text, save) {

		this.update_all = true;

		this.lineRoot = false
		this.meshRoot = false
		this.root = false
		// var lines = this.parseText(text)
		this.showPreload();
		main.view_azim.clearAllContainer();
		var lines;
		main.info_ies = {
			
		};

		if(text.indexOf('IESNA')>=0){
			var itm_data = main.initData.parse(text)//this.parseTextIES(text);
			main.info_ies = itm_data.info_ies;
			lines = itm_data.lines;

			if(save){
				this.start_azim = main.info_ies.azim.arr;
				this.start_polar = main.info_ies.polar.arr;	
			}

			

		} else {
			lines = this.parseText(text);
			// main.info_ies = false;
		}
		main.info_ies.lines = lines;
		this.start_lines = lines;


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

		var normalR = 1 / maxR;

		for(var i = 0; i < lines.length; i++) {
			var row = lines[i]

			for(var j = 0; j < row.length; j++) {
				row[j] *= normalR
			}
		}
		main.info_ies.minR = minR;
		main.info_ies.maxR = maxR;

		return this.createData(lines);
	},

	createData: function(lines, no_update){
		this.subdivisions = Math.max(8, Math.ceil(64/lines[0].length));
		this.verticals = Math.ceil(180/lines.length);
		console.log('verticals:',this.verticals)

		var linesCount = lines.length;
		var data = [];

		var planesCount = lines.length ? lines[0].length : 0;
		var totalCount  = planesCount * (this.subdivisions +1);
		

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
			
			var a = finish_angle * i/linesCount - Math.PI/2;

			for(var j = 0; j < row.length; j++) {
				var b = (2*Math.PI   * j/totalCount + start_azim)%(Math.PI*2)

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


		main.info_ies.minY = minY;
		main.info_ies.maxY = maxY;

		main.info_ies.data = data;

		var height = maxY - minY

		var root     = new THREE.Object3D,
		    lineRoot = new THREE.Object3D,
		    meshRoot = new THREE.Object3D,
		    lradRoot = new THREE.Object3D
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

		return this.loadFigure();
	},

	showProgress: function (){
		var percent = Math.floor((this.index/this.planesCount)*100) +'%';

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

		this.root.add(this.lineRoot)
		this.root.add(this.meshRoot)

		var s = 1.002
		this.lineRoot.scale.set(s, s, s)
		var obj = {
			object: this.root,
			lineRoot: this.lineRoot,
			meshRoot: this.meshRoot
		};

		this.createIndexLines()
		
		main.view_azim.loadNewFigure(this.index_zero, this.index_perp)

		main.view.setTree(obj)
		onMaterial()
		main.view.toCenter()
		dom.remclass(this.cont_preload, 'show');
		this.viewFigure = true;
		main.info_ies.info_data.light_flow = this.getLightFlow()

		this.start_light_flow = main.info_ies.info_data.light_flow;

		if(this.update_all){
			main.view_info_ies.updateInfo();
			this.update_all = false	
		} else {
			main.view_info_ies.loadMiniView()
		}

		return {
			object: this.root,
			lineRoot: this.lineRoot,
			meshRoot: this.meshRoot
		}
	},

	createIndexLines: function(){

		var min_azim = main.info_ies.azim.min_angle;
		var mean = min_azim == 0 ? 90 : 45;
		var index_zero = main.info_ies.azim.arr.indexOf(min_azim);
		var index_perp  = main.info_ies.azim.arr.indexOf(min_azim + mean);

		this.index_zero.itm = index_zero;
		this.index_zero.sim = (Math.floor(this.lineRoot.children.length/2) + index_zero)%this.lineRoot.children.length;

		this.index_perp.itm = index_perp >= 0 ?  index_perp : undefined ;
		this.index_perp.sim = index_perp >= 0 ?  (Math.floor(this.lineRoot.children.length/2) + index_perp)%this.lineRoot.children.length : undefined ;

	},

	getLightFlow: function(){
		var info = main.info_ies;
		var lines = info.lines;
		var l_i = info.polar.arr.length;
		var l_j = info.azim.arr.length;

		var delt_c = ((info.azim.sum/180)*Math.PI)/(l_j-1);
		var delt_p = ((info.polar.sum/180)*Math.PI)/(l_i-1);

		var s_j = l_j == 1 ? 0 : 1;
		var f_j = l_j - s_j;

		var num_i = getNum(0,0)
		var all_sum = 0
		for(var i = 1; i < l_i-1; i++){
			var sum = 0;
			for(var j = s_j; j < f_j; j++){
				var num_itm = getNum(i,j)
				sum += num_itm
			}

			all_sum += sum
		}
		var res = 0;

		if(l_j == 1){
			res = (all_sum + (getNum(0,0) + getNum(l_i-1,0))/2 )*(Math.PI*2)*delt_p
		} else {
			var path_f = (getNum(0, 0) + getNum(l_i-1, 0) + getNum(0, l_j-1) + getNum(l_i-1, l_j-1))/4
			var sum_polar = 0;

			for(var i = 1; i < l_i-1; i++ ){
				sum_polar += getNum(i, 0) + getNum(i, l_j-1)
			}
			var sum_azim = 0

			for(var j = 1; j < l_j-1; j++ ){
				sum_azim += getNum(0, j) + getNum(l_i-1, j)
			}
			var path_sum = 0.5*(sum_azim + sum_polar);
			var itm_num  = (path_f+path_sum + all_sum);
			res = delt_c*delt_p*itm_num;

			res *= 360/info.azim.sum;
		}
		return Math.floor(res)

		function getNum(i,j){
			var a = info.polar.arr[i]/180;
			var sin_i = Math.sin(Math.PI*a);
			var n = lines[i][j];
			var num = (n*sin_i)*main.info_ies.maxR;
			return num
		}

	},

	updateLightFlow: function(light_flow){
		var info = main.info_ies
		var lines = info.lines;
		var l_i = info.polar.arr.length;
		var l_j = info.azim.arr.length;

		var delt_c = (( info.azim.sum/180)*Math.PI)/(l_j-1);
		var delt_p = ((info.polar.sum/180)*Math.PI)/(l_i-1);
		var res = 0;
		var path = light_flow/main.info_ies.info_data.light_flow;

		var s = light_flow/this.start_light_flow;
		this.root.scale.set(s,s,s)
		main.view.toCenter()
		main.view.needsRedraw = true;
		// var m = main.info_ies.info_data.line[0][2];
		// console.log(m)

		// var k = main.info_ies.maxR*m;
		var get_new_flow = main.info_ies.info_data.light_flow;

		if(path != 1){
			this.updateArrayData(path)
			// this.updateFigure(path);
			get_new_flow = this.getLightFlow();
			// console.log('flow',get_new_flow)
		}

		main.info_ies.info_data.light_flow = get_new_flow
	},
	updatePolar: function(polar){
		var info = main.info_ies;
		var lines = info.lines;
		var info_polar = info.polar
		var l_i = info_polar.arr.length;
		console.log(info_polar.sum/(polar-1))
		console.log(info_polar.sum/(l_i-1))
	},
	updateAzim: function(azim){
		var info = main.info_ies;
		var lines = info.lines;
		var info_azim = info.azim
		var l_i = info_azim.arr.length;

		var sum = l_i > 1 ? info_azim.sum : this.max_azim_data;
		var path = sum/(azim-1);
		var new_arr = [info_azim.min];
		
		for(var i = 1; i < azim; i++){
			var angle = info_azim.min + path*i
			if(info_azim.max_angle != 360){
				angle %= 360
			} else {
				angle = angle <= 360 ? angle : angle%360 ;
			}
			new_arr.push(parseFloat((angle).toFixed(2)));
		}

		this.createNewDataAzim(new_arr)

	},

	createNewDataAzim: function(new_azim){
		var info = main.info_ies;
		var lines = this.start_lines;
		var info_azim = info.azim;

		var arr_azim = this.start_azim;
		// console.log(arr_azim.join(', '))
		var new_lines = [];
		var arr_info = [];
		var l_p = info.polar.arr.length;
		this.showPreload();
		for(var i = 0; i < new_azim.length; i++){
			var a = new_azim[i];
			var obj = {};

			obj.itm = a;

			var p = 0;
			var n = 360;
			for(var j = 0; j < arr_azim.length; j++){
				if(a >= arr_azim[j]){
					p = Math.max(p, arr_azim[j]);
				}
				if(a <= arr_azim[j]){
					n = Math.min(n, arr_azim[j]);
				}
			}

			obj.prev    = p;
			obj.prev_id = arr_azim.indexOf(p);
			obj.next = arr_azim.length > 1 ? n : 0;
			obj.next_id = arr_azim.length > 1 ? arr_azim.indexOf(n) : 0;

			arr_info.push(obj)
		}

		for(var l = 0; l < lines.length; l++){
			// new_lines[l] = [];
			var arr = [];
			var row = lines[l];
			for(var j = 0; j < new_azim.length; j++){
				
				var p_id = arr_info[j].prev_id;
				var p_a = arr_info[j].prev
				var n_id = arr_info[j].next_id;
				var n_a = arr_info[j].next
				var diff = n_a - p_a;
				var p = (new_azim[j] - arr_info[j].prev)/diff

				p = isFinite(p) ? p : 0
				var a = row[p_id],
				    b = row[n_id];

				var val = (b - a) * p + a;

				arr[j] = val
			}
			// console.log(arr, row.slice(0, arr_azim.length) )
			new_lines[l] = arr
		}

		var first_angle_azim = parseFloat(new_azim[0]);
		var last_angle_azim = parseFloat(new_azim[new_azim.length-1]);
		var sum_azim = last_angle_azim + (360 - first_angle_azim)%360;
		var update_info_azim = main.initData.getInfoAngle(new_azim)

		new_lines = main.initData.arrReverse(new_lines, update_info_azim.sum);


		main.info_ies.lines = new_lines;
		main.info_ies.azim = update_info_azim;

		// console.log('new_lines',new_lines)
		this.createData(new_lines)

		// main.view_info_ies.loadMiniView();

		// this.updateLineRoom();

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

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color',    new THREE.Float32Attribute(colors, 3))

		return new THREE.Line(geometry, this.lineMaterial)
	},
	updateMaterial: function(){
		var color = main.linesOnly ? 0xffffff : 0x000000;
		var vertexColors = main.linesOnly ? THREE.VertexColors : 0
		var visible = main.linesVisible
		var zero = this.index_zero
		var perp = this.index_perp
		var arr_azim = main.info_ies.azim;

		var itm_angle = arr_azim.arr[this.index_line];
		var index_asim = 0;

		if(arr_azim.max_angle > 180){ //  || (arr_azim.min_angle == 90 && arr_azim.max_angle == 270)){
			var mean = (arr_azim.max_angle - arr_azim.min_angle)/2;
			var asim_angle = itm_angle + mean;
			if(asim_angle > arr_azim.max) {
				asim_angle -= arr_azim.max
			}
			var index_asim_angle = arr_azim.arr.indexOf(asim_angle)

			if(index_asim_angle >= 0) {
				index_asim = index_asim_angle
			} else {
				index_asim = (Math.floor(this.lineRoot.children.length/2) + this.index_line)%this.lineRoot.children.length;
			}
		} else if(arr_azim.max_angle == 180){
			index_asim = arr_azim.arr.length + this.index_line - 1;
		} else if(arr_azim.max_angle == 90) {
			index_asim = (arr_azim.arr.length*2 - 1) + this.index_line -1;
		}

		for(var l = 0; l < this.lineRoot.children.length; l++){
			var line = this.lineRoot.children[l];
			if(l == zero.itm || l == zero.sim){
				line.material.color.set(0xff0000);
				line.material.vertexColors = 0;
			} else if(l == perp.itm || l == perp.sim) {
				line.material.color.set(0x0000ff);
				line.material.vertexColors = 0;
			} else if(l == this.index_line || l == index_asim){
				line.material.color.set(0x00ff00);
				line.material.vertexColors = 0;
			} else {
				line.material.color.set(color);
				line.material.vertexColors = vertexColors;
			}

			line.material.visible = visible;
			line.material.needsUpdate = true
		}
		for(var m = 0; m < this.meshRoot.children.length; m++){
			var mesh = this.meshRoot.children[m];
			mesh.material.visible = !main.linesOnly
		}

		main.view.needsRedraw = true;

		main.view_azim.updateViewAzim(this.index_line, index_asim);

	},
	updateArrayData: function(path){
		var lines = main.info_ies.lines;

		for(var i = 0; i < lines.length; i++) {
			var row = lines[i];
			
			for(var j = 0; j < row.length; j++) {
				var r = row[j]
				main.info_ies.lines[i][j] = r*path
			}
		}
	},
	updateFigure: function(path){
		for(var l = 0; l < this.lineRoot.children.length; l++){
			var line = this.lineRoot.children[l];
			var pos = line.geometry.attributes.position.array
			for(var p = 0; p < pos.length; p++){
				pos[p] *= path;
			}

			//line.material.visible = visible;
			line.geometry.attributes.position.needsUpdate = true;
			line.material.needsUpdate = true
		}

		// console.log('data:',this.data)
		for(var m = 0; m < this.meshRoot.children.length; m++){
			var mesh = this.meshRoot.children[m];
			// console.log('mesh',mesh)
			var ver = mesh.geometry.vertices
			for(var v = 0; v < ver.length; v++){
				ver[v].x *= path;
				ver[v].y *= path;
				ver[v].z *= path;
			}
			mesh.geometry.verticesNeedUpdate = true;
			// mesh.geometry.attributes.vertices.needsUpdate = true;
			//mesh.material.visible = !main.linesOnly
		}
		main.view.needsRedraw = true;

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
	}
	
	

	
	
	
}
