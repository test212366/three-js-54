import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

import fragmentShader1 from './shaders/fragment copy.glsl'
import vertexShader1 from './shaders/vertex copy.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

import chars from './letters (1).png'
export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x000000, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 10
		)
 
		this.camera.position.set(0, 0, 2) 
 
		this.time = 0

		const frusumSize = 1.4
		const aspect = 1
		this.camera = new THREE.OrthographicCamera(frusumSize *aspect / -2, frusumSize * aspect / 2, frusumSize / 2, frusumSize / -2, -1000, 1000)
		this.camera.position.set(0,0,2)
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true

		this.gridSize = 1
		this.size = 200
		this.cellSize = this.gridSize / this.size

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
		this.initVideo()
 
	}

	initVideo() {
		this.video = document.getElementById('video')
		this.canvas = document.createElement('canvas')
		this.canvas1 = document.createElement('canvas')
		this.ctx1 = this.canvas1.getContext('2d')

		this.ctx = this.canvas.getContext('2d')
		this.canvas.width = this.size
		this.canvas.height = this.size

		this.canvas1.width = 1024
		this.canvas1.height = 1024
		document.body.appendChild(this.canvas)
		document.body.appendChild(this.canvas1)

		this.mc = new THREE.CanvasTexture(this.canvas1)
		this.material1.uniforms.canvas.value = this.mc
		this.mc.needsUpdate = true

		this.video.addEventListener('play', () => {
 
			this.timerCallback()
		}, false)
	}
	timerCallback() {
		if(this.video.paused || this.video.ended) {
			return
		}
		this.computeFrame()
		let self = this
		setTimeout(() => {
			self.timerCallback()
		}, 0)
	}
	computeFrame() {
		let scales = new Float32Array(this.size ** 2)
		this.ctx.drawImage(this.video, 0,0, this.size, this.size)
		this.ctx1.drawImage(this.video, 0,0, 1024,1024)

		let imageData = this.ctx.getImageData(0,0, this.size, this.size)

		for (let i = 0; i < imageData.data.length; i+=4) {
 

			scales.set([1. - imageData.data[i] / 255], i / 4)


			
		}
		this.plane.geometry.attributes.instanceScale.array = scales
		this.plane.geometry.attributes.instanceScale.needsUpdate = true
		this.mc.needsUpdate = true
		// this.ctx1.drawImage(this.video, 0,0, this.width, this.height)
		// let frame = this.ctx1.getImageDate(0,0, this.width, this.height)
		// let l = frame.data.length / 4

		// for (let i = 0; i < l; i++) {
		// 	let r = frame.data[i * 4 + 0]
		// 	let g = frame.data[i * 4 + 1]
		// 	let b = frame.data[i * 4 + 2]
		// 	if(g > 100 && r > 100 && b < 43) 
		// 		frame.data[i * 4 + 3] = 0

				

			
		// }
		// this.ctx2.putImageData(frame, 0,0)
		// return
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height
 

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				chars: {value: new THREE.TextureLoader().load(chars)},
				 

				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			fragmentShader,
			// transparent: true
		})
		
		this.geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize)
		this.plane = new THREE.InstancedMesh(this.geometry, this.material, this.size ** 2)
		let dummy = new THREE.Object3D()
		let count = 0
		let scales = new Float32Array(this.size**2)
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				dummy.position.set(j * this.cellSize - 0.5, - i * this.cellSize + 0.5)
				dummy.updateMatrix()
				scales.set([Math.random()], count)
				this.plane.setMatrixAt(count++, dummy.matrix)
	 
			}
			
		}
		this.plane.instanceMatrix.needsUpdate = true
		this.plane.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1))
	 
		this.scene.add(this.plane)


		this.geo1 = new THREE.PlaneGeometry(1,1)
		this.material1 =  new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				chars: {value: new THREE.TextureLoader().load(chars)},
				canvas: {value: null},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader: vertexShader1,
			fragmentShader: fragmentShader1
		})
		this.mesh1 = new THREE.Mesh(this.geo1, this.material1)
		this.scene.add(this.mesh1)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		 
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 