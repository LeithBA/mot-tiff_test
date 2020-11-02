import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Tools/Sizes.js'
import Time from './Tools/Time.js'

import Camera from './Camera.js'
import World from './World/index.js'

export default class App {
  constructor(_options) {
    //window.scrollTo(0, 0);

    // Set options
    this.canvas = _options.canvas
    // Set up
    this.time = new Time()
    this.sizes = new Sizes()

    this.setConfig()
    this.setRenderer()
    this.setCamera()
    this.setWorld()
    this.setTheme()

  }
  setRenderer() {
    // Set scene
    this.scene = new THREE.Scene()
    // Set renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    })
    // Set background color
    this.renderer.setClearColor(0x000000, 0)
    // Set renderer pixel ratio & sizes
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
    // Resize renderer on resize event
    this.sizes.on('resize', () => {
      this.renderer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
    })
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Set RequestAnimationFrame with 60ips
    this.time.on('tick', () => {
      this.renderer.render(this.scene, this.camera.camera)
    })
  }
  setCamera() {
    // Create camera instance
    this.camera = new Camera({
      sizes: this.sizes,
      renderer: this.renderer,
      debug: this.debug,
    })
    // Add camera to scene
    this.scene.add(this.camera.container)
  }
  setWorld() {
    // Create world instance
    this.world = new World({
      time: this.time,
      debug: this.debug,
      sizes: this.sizes,
    })
    // Add world to scene
    this.scene.add(this.world.container)
  }
  setConfig() {
    if (window.location.hash === '#debug') {
      this.debug = new dat.GUI({ width: 420 })
    }
  }

  setTheme() {
    let darkToggle = document.getElementsByClassName("darkThemeToggle");
    darkToggle[0].addEventListener("click", function () {
      let darkOn = document.getElementById("darkThemeOn");
      let darkOff = document.getElementById("darkThemeOff");
      document.body.classList.add("darkTheme");
      darkOff.style.visibility = "visible";
      darkOn.style.visibility = "hidden";
    });
    darkToggle[1].addEventListener("click", function () {
      let darkOn = document.getElementById("darkThemeOn");
      let darkOff = document.getElementById("darkThemeOff");
      document.body.classList.remove("darkTheme");
      darkOff.style.visibility = "hidden";
      darkOn.style.visibility = "visible";
    });
  }
}
