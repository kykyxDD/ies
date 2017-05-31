function DataBuilder() {
	this.lineMaterial = new THREE.LineBasicMaterial({
		// color: 0x000000,
		vertexColors: THREE.VertexColors
	})

	this.meshMaterial = new THREE.MeshBasicMaterial({
		// color: 0x000000,
		vertexColors: THREE.VertexColors
	})
}

DataBuilder.prototype = {
	buildFromSource: function(text, options) {
		var lines = this.parseText(text)

		var linesCount = lines.length

		var data = []

		var subs = options.subdivisions || 0
		var planesCount = lines[0].length
		var totalCount = planesCount * (subs +1)

		// for(var i = 0; i < linesCount; i++) {
		// 	var row = lines[i]

		// 	for(var j = 0; j < subs; j++) {
		// 		for(var k = row.length -1; k >= 0; k--) {
		// 			var l = (k + 1) % row.length

		// 		}
		// 	}
		// }

		for(var i = 0; i < totalCount; i++) {
			data.push([])
		}

		for(var i = 0; i < linesCount; i++) {
			var row = lines[i]

			for(var j = row.length -1; j >= 0; j--) {
				var a = row[j]
				,   b = row[(j+1)%row.length]

				for(var k = subs -1; k >= 0; k--) {
					var p = k / subs

					row.splice(j + 1, 0, (b - a) * p + a)
				}
			}

			for(var j = 0; j < row.length; j++) {
				var a =   Math.PI/2 * i/linesCount - Math.PI/2
				,   b = 2*Math.PI   * j/totalCount

				var r = row[j]
				,   x2 = r * Math.cos(a)
				,   y2 = r * Math.sin(a)

				var x3 = x2 * Math.cos(b)
				,   y3 = y2
				,   z3 = x2 * Math.sin(b)

				data[j].push(new THREE.Vector3(x3, y3, z3))
			}
		}

		var root     = new THREE.Object3D
		,   lineRoot = new THREE.Object3D
		,   meshRoot = new THREE.Object3D
		,   lradRoot = new THREE.Object3D

		var planesCount = data.length
		for(var i = 0; i < planesCount; i++) {
			var j = (i+1) % planesCount

			if(i % (subs +1) === 0) {
				lineRoot.add(this.createPlane(data[i], options.lines))
			}
			meshRoot.add(this.createMesh(data[i], data[j]))
		}

		var radiusCount = options.heights +1 || 1
		for(var k = 1; k < radiusCount; k++) {
			lradRoot.add(this.createRadius(k / radiusCount, data, options.lines))
		}

		root.add(lineRoot)
		root.add(meshRoot)
		root.add(lradRoot)

		lineRoot.scale.multiplyScalar(1.001)
		lradRoot.scale.multiplyScalar(1.001)

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

	createRadius: function(k, data, colored) {
		var vertices = []
		var colors = []

		var color = this.getColor(k)
		var j = Math.floor(k * data[0].length)
		for(var i = 0; i < data.length; i++) {
			var v = data[i][j]

			color.toArray(colors, i * 3)
			vertices.push(v.x, v.y, v.z)
		}
		var v = data[0][j]
		color.toArray(colors, i * 3)
		vertices.push(v.x, v.y, v.z)

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color',    new THREE.Float32Attribute(colors, 3))

		return new THREE.Line(geometry, this.lineMaterial)
	},

	createPlane: function(data, colored) {
		var vertices = []
		,   colors   = []

		var lines = data.length
		,   color = new THREE.Color(0xffffff)
		for(var i = 0; i < lines; i++) {
			var v = data[i]

			vertices.push(v.x, v.y, v.z)

			this.getColor(i / lines, color)
			color.toArray(colors, i * 3)
		}

		var geometry = new THREE.BufferGeometry
		geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3))
		geometry.addAttribute('color', new THREE.Float32Attribute(colors, 3))

		return new THREE.Line(geometry, this.lineMaterial)
	},

	createMesh: function(left, right) {
		var geometry = new THREE.Geometry

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


		return new THREE.Mesh(geometry, this.meshMaterial)
	},

	parseText: function(text) {
		var lines = text.replace(/,/g, '.').trim().split('\n')

		return lines.map(function(line) { return line.split(';').map(parseFloat) })

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
