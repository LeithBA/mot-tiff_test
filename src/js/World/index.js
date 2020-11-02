import * as THREE from 'three'

import AmbientLight from './AmbientLight.js'
import PointLight from './PointLight.js'
import Cube from './Cube.js'
import Painting from './Painting.js'

export default class World {
  constructor(_options) {
    // Set options
    this.time = _options.time
    this.debug = _options.debug
    this.sizes = _options.sizes

    // Set up
    this.container = new THREE.Object3D()

    if (this.debug) {
      this.debugFolder = this.debug.addFolder('World')
      this.debugFolder.open()
    }

    this.setAmbientLight()
    this.setPointLight()
    //this.setCube()
    this.setPainting()
  }
  setAmbientLight() {
    this.light = new AmbientLight({
      debug: this.debugFolder,
    })
    this.container.add(this.light.container)
  }
  setPointLight() {
    this.light = new PointLight({
      debug: this.debugFolder,
    })
    this.container.add(this.light.container)
  }
  setCube() {
    this.cube = new Cube({
      time: this.time,
      debug: this.debugFolder,
    })
    this.container.add(this.cube.container)
  }
  setPainting() {
    this.painting = new Painting({
      time: this.time,
      debug: this.debugFolder,
      sizes: this.sizes,
    })
    this.container.add(this.painting.container)
  }
}
