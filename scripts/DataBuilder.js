function DataBuilder() {

}

DataBuilder.prototype = {
	buildFromSource: function(text, subs, lines) {
		var data = this.parseText(text)

		var root     = new THREE.Object3D
		,   lineRoot = new THREE.Object3D
		,   meshRoot = new THREE.Object3D

		var planesCount = data.length
		var planes = []
		for(var i = 0; i < planesCount; i++) {
			lineRoot.add(this.createPlane(data[i]))
			meshRoot.add(this.createMesh(data[i], data[(i+1)%data.length]))
		}

		root.add(lineRoot)
		root.add(meshRoot)

		return {
			object: root,
			lineRoot: lineRoot,
			meshRoot: meshRoot
		}
	},

	getColor: function(t, color) {
		if(!color) color = new THREE.Color

		var c = f.softcolor(t * 0.7)

		color.r = c[0]
		color.g = c[1]
		color.b = c[2]

		return color
	},

	createPlane: function(data) {
		var vertices = []
		,   colors   = []

		var lines = data.length
		,   color = new THREE.Color(0xffffff)
		for(var i = 0; i < lines; i++) {
			var v = data[i]
			,   k = i / lines

			vertices.push(v.x, v.y, v.z)

			this.getColor(k, color)
			color.toArray(colors, i * 3)
		}

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color',    new THREE.Float32Attribute(colors,   3))

		var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors })

		return new THREE.Line(geometry, material)
	},

	createMesh: function(left, right) {
		var geometry = new THREE.Geometry
		var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors })

		var lines = left.length
		for(var i = 0; i < lines -1; i++) {
			var j = i + 1

			var a = left [i]
			,   b = left [j]
			,   c = right[i]
			,   d = right[j]

			var cA = this.getColor(i / lines)
			,   cB = this.getColor(j / lines)

			var vi = geometry.vertices.length
			var fA = new THREE.Face3(vi +2, vi +0, vi +3, null, [cB, cA, cB])
			,   fB = new THREE.Face3(vi +0, vi +1, vi +3, null, [cA, cA, cB])

			geometry.vertices.push(a, b, c, d)
			geometry.faces.push(fA, fB)
		}


		return new THREE.Mesh(geometry, material)
	},

	parseText: function(text) {
		var lines = text.replace(/,/g, '.').trim().split('\n')
		,   rows = lines.length
		,   cols = lines[0].split(';').length
		,   data = []

		for(var i = 0; i < cols; i++) data.push([])

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

		return data
	}
}
