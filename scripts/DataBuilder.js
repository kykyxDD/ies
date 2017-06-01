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

	heights: 6,
	verticals: 2,
	subdivisions: 16,

	colorK: 0.1,
	colorA: -0.35,

	buildFromSource: function(text) {
		var lines = this.parseText(text)

		var linesCount = lines.length

		var data = []

		var planesCount = lines[0].length
		var totalCount = planesCount * (this.subdivisions +1)


		for(var i = 0; i < totalCount; i++) {
			data.push([])
		}

		var linesInterpolated = []
		for(var i = 0; i < lines.length -1; i++) {
			var a = i ? lines[i - 1] : lines[0]
			,   b = lines[i]
			,   c = i + 1 < linesCount ? lines[i+1] : b
			,   d = i + 2 < linesCount ? lines[i+2] : c

			for(var j = 0; j < this.verticals; j++) {
				var p = j / this.verticals
				var row = []

				for(var k = 0; k < a.length; k++) {
					row.push(this.cubicInterpolate(p, a[k], b[k], c[k], d[k]))
				}

				linesInterpolated.push(row)
			}
		}

		linesInterpolated.push(lines[linesCount -1])

		linesCount = (linesCount - 1) * this.verticals + 1
		lines = linesInterpolated

		var minY =  Infinity
		,   maxY = -Infinity
		for(var i = 0; i < linesCount; i++) {
			var row = lines[i]

			for(var j = row.length -1; j >= 0; j--) {
				var a = row[j]
				,   b = row[(j+1)%row.length]

				for(var k = this.subdivisions -1; k >= 0; k--) {
					var p = k / this.subdivisions

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

				if(minY > y3) minY = y3
				if(maxY < y3) maxY = y3

				data[j].push(new THREE.Vector3(x3, y3, z3))
			}
		}

		var height = maxY - minY

		var root     = new THREE.Object3D
		,   lineRoot = new THREE.Object3D
		,   meshRoot = new THREE.Object3D
		,   lradRoot = new THREE.Object3D

		var planesCount = data.length
		for(var i = 0; i < planesCount; i++) {
			var j = (i+1) % planesCount

			if(i % (this.subdivisions +1) === 0) {
				lineRoot.add(this.createPlane(data[i], height))
			}
			meshRoot.add(this.createMesh(data[i], data[j], height))
		}

		var radiusCount = this.heights +1 || 1
		for(var k = 1; k < radiusCount; k++) {
			lradRoot.add(this.createRadius(k / radiusCount, data, minY, maxY))
		}

		root.add(lineRoot)
		root.add(meshRoot)
		root.add(lradRoot)

		var s = 1.002
		lineRoot.scale.set(s, s, s)
		lradRoot.scale.set(s, s, s)

		return {
			object: root,
			lineRoot: lineRoot,
			meshRoot: meshRoot
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

		var k = Math.pow(this.colorK, Math.E)
		var c = f.softcolor(-r * k + this.colorA)

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

		return new THREE.Line(geometry, this.lineMaterial)
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
