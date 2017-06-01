function View3(root) {
	this.element   = dom.div('view3')
	this.renderer  = new THREE.WebGLRenderer

	this.object    = new THREE.Object3D
	this.camera    = new THREE.PerspectiveCamera
	// this.camera    = new THREE.OrthographicCamera
	this.scene     = new THREE.Scene
	// this.scene.fog = new THREE.FogExp2(this.background, 0.6)
	this.orbit     = new THREE.OrbitControls(this.camera, this.element)
	this.fpview    = new THREE.FirstPersonControls(this.camera, this.element)
	this.light     = new THREE.AmbientLight(0xffffff)
	this.direct    = new THREE.DirectionalLight(0xffffff, 0.2)
	this.sunlight  = new THREE.DirectionalLight(0xffffff, 0.5)
	this.raycaster = new THREE.Raycaster

	this.wireframe = new THREE.MeshBasicMaterial({ wireframe: true })
	this.normals   = new THREE.MeshNormalMaterial()

	this.grid      = new THREE.Object3D
	this.gridXZ    = this.makeGrid()
	this.gridXY    = this.makeGrid()
	this.gridYZ    = this.makeGrid()
	this.ring      = this.makeRing(100, 100)

	this.gridXZ.normal = new THREE.Vector3(0, 1, 0)
	this.gridXY.normal = new THREE.Vector3(0, 0, 1)
	this.gridYZ.normal = new THREE.Vector3(1, 0, 0)

	this.grid.add(this.gridXZ)
	this.grid.add(this.gridXY)
	this.grid.add(this.gridYZ)
	this.object.add(this.light)
	this.object.add(this.ring)
	// this.object.add(this.direct)
	// this.object.add(this.sunlight)
	// this.object.add(this.crosshair)
	// this.scene.add(this.grid)
	this.scene.add(this.object)

	this.gridXY.rotation.x = Math.PI/2
	this.gridYZ.rotation.z = Math.PI/2
	this.renderer.autoClear = false
	this.renderer.setClearColor(this.background)

	var cpos = 100
	this.camera.position.set(cpos, Math.pow(cpos, 4/5), cpos * 5/4)
	this.sunlight.position.set(1000, 600, -1000)
	this.orbit.update()
	this.updateRay()

	this.fpview.events.on('capture', this.onCapture, this)

	dom.append(this.element, this.renderer.domElement)
	dom.append(root, this.element)
}

View3.prototype = {
	background: 0x000000,

	enableWire: false,
	enableNormal: false,

	makeGrid: function() {
		var size = 10
		var divisions = 200
		var color1 = new THREE.Color(0x333333)
		var color2 = new THREE.Color(0xBBBBBB)

		var center = divisions / 2;
		var step = ( size * 2 ) / divisions;
		var vertices = [], colors = [];

		for ( var i = -divisions, j = 0, k = - size; i <= divisions; i ++, k += step ) {

			vertices.push( - size, 0, k, size, 0, k );
			vertices.push( k, 0, - size, k, 0, size );

			var color = i % 10 === 0 ? color1 : color2;

			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
		}

		var geometry = new THREE.BufferGeometry()
		geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) )
		geometry.addAttribute( 'color', new THREE.Float32Attribute( colors, 3 ) )

		var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } )
		material.transparent = true

		return new THREE.LineSegments(geometry, material)
	},

	makeRing: function(radius, divisions) {
		var geometry = new THREE.Geometry

		for(var i = 0; i < divisions; i++) {
			var j = (i + 1) % divisions

			var a = 2*Math.PI * i/divisions
			,   b = 2*Math.PI * j/divisions

			var vA = new THREE.Vector3(radius * Math.cos(a), 0, radius * Math.sin(a))
			,   vB = new THREE.Vector3(radius * Math.cos(b), 0, radius * Math.sin(b))
			,   v0 = new THREE.Vector3(0, 0, 0)

			var vi = geometry.vertices.length
			var fA = new THREE.Face3(vi +0, vi +1, vi +2)

			geometry.vertices.push(vA, vB, v0)
			geometry.faces.push(fA)
		}

		var material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.5,
			color: 0x7aa1bd
		})

		return new THREE.Mesh(geometry, material)
	},

	setTree: function(object) {
		if(this.tree) {
			this.tree.object.traverse(this.destroy)
			this.object.remove(this.tree.object)

		}

		this.tree = object

		if(this.tree) {
			this.object.add(this.tree.object)
		}

		this.needsRedraw = true
	},

	destroy: function(object) {
		if(object.geometry) {
			object.geometry.dispose()
		}
		if(object.material) {
			// object.material.dispose()
		}
	},

	toCenter: function() {
		if(this.ring) {
			this.object.remove(this.ring)
		}

		var box = new THREE.Box3

		if(this.tree) this.tree.object.traverse(function(o) {
			if(o.geometry) {
				if(!o.geometry.boundingBox) {
					o.geometry.computeBoundingBox()
				}

				box.union(o.geometry.boundingBox)
			}
		})

		var offset = this.camera.position.clone().sub(this.orbit.target).normalize()
		var radius = 50

		if(box.isEmpty()) {
			this.orbit.target.set(0, 0, 0)

		} else {
			radius = box.getSize().length()
			box.getCenter(this.orbit.target)
			this.orbit.target.set(0, this.orbit.target.y, 0)
		}

		this.camera.position.copy(offset).setLength(radius).add(this.orbit.target)

		this.orbit.update()

		this.ring = this.makeRing(radius / 2 * 0.3, 100)
		this.object.add(this.ring)
	},

	onKey: function(e) {
		if(kbd.changed) switch(kbd.key) {

			case 'c':
				this.toCenter()
			break

			case 'f':
				this.fpview.capture()
			break

			case 'g':
				this.enableWire = kbd.down
				this.needsRedraw = true
			break

			default:
				if(this.orbit.enabled) {
					this.orbit.onKeyDown(e)
				} else {
					this.fpview.onKey(e)
				}
			break
		}
	},

	onCapture: function(capture) {
		this.fpactive = capture
		this.orbit.enabled = !capture
		dom.togclass(this.element, 'first-person', capture)
	},

	onResize: function() {
		var w = this.element.offsetWidth
		,   h = this.element.offsetHeight

		// this.view.autoresize()
		this.renderer.setSize(w, h)

		this.camera.fov    = 45
		this.camera.aspect = w / h
		this.camera.near   = 0.01
		this.camera.far    = 100

		this.camera.updateProjectionMatrix()

		// this.camera.left   = -300
		// this.camera.right  =  300
		// this.camera.top    = -300
		// this.camera.bottom =  300

		this.elementOffset = dom.offset(this.element)
		this.toCenter()

		this.needsRedraw = true
	},

	updateRay: function() {
		this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)

		var direction = this.raycaster.ray.direction

		var projXZ = direction.dot(this.gridXZ.normal)
		,   projXY = direction.dot(this.gridXY.normal)
		,   projYZ = direction.dot(this.gridYZ.normal)

		this.gridXZ.material.opacity = Math.abs(projXZ)
		this.gridXY.material.opacity = Math.abs(projXY)
		this.gridYZ.material.opacity = Math.abs(projYZ)

		// this.gridXZ.position.y = 0.4 * projXZ + this.camera.position.y
		// this.gridXY.position.z = 0.4 * projXY + this.camera.position.z
		// this.gridYZ.position.x = 0.4 * projYZ + this.camera.position.x

		this.direct.target.position.copy(this.orbit.target)
		this.direct.position.copy(this.camera.position)
	},

	draw: function() {
		this.renderer.clear()

		if(this.enableWire) {
			this.scene.overrideMaterial = this.wireframe
		} else if(this.enableNormal) {
			this.scene.overrideMaterial = this.normals
		} else {
			this.scene.overrideMaterial = null
		}

		this.grid.visible = false
		this.object.visible = true
		this.renderer.render(this.scene, this.camera)

		this.scene.overrideMaterial = null

		this.grid.visible = true
		this.object.visible = false
		this.renderer.render(this.scene, this.camera)
	},

	onUpdate: function(dt) {
		this.fpview.update(dt)
		if(this.fpview.changed) {
			this.fpview.changed = false
			this.orbit.changed = true
			this.orbit.target.add(this.fpview.delta)
			this.needsRedraw = true
		}

		if(this.orbit.changed) {
			this.orbit.changed = false
			this.needsRedraw = true
			this.updateRay()
		}

		if(this.orbit.radius && this.orbit.radius !== this.fpview.speed) {
			this.fpview.speed = this.orbit.radius
			this.fpview.needsUpdateForce = true
		}

		if(this.needsRedraw) {
			this.needsRedraw = false

			this.draw()
		}
	}
}
