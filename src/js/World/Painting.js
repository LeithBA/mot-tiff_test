import * as THREE from 'three'
import Mouse from '../Tools/mouse.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import paintingModel from '../../models/painting.glb'
import { FontLoader } from 'three';

export default class Painting {
  constructor(_options) {
    // Options
    this.time = _options.time
    this.debug = _options.debug
    this.sizes = _options.sizes
    // Set up
    this.container = new THREE.Object3D()
    this.params = {
      color: 0xfafafa,
    }


    this.paint = [];
    this.baseMats = [6];
    this.createPainting()

    this.mouseX = 0;
    this.mouseY = 0;
    if (this.debug) {
      this.setDebug()
    }
  }

  createPainting() {
    const loader = new GLTFLoader();
    const this_ = this;

    loader.load(paintingModel,

      function (gltf) {
        this_.painting = gltf.scene;
        let meshes = this_.painting.children[0].children[0].children;
        let i = 0;
        meshes.forEach(mesh => {
          let baseMat = mesh.material;
          mesh.material = new THREE.MeshPhongMaterial({
            color: baseMat.color,
            flatShading: false,
            side: THREE.FrontSide,
            shadowSide: THREE.FrontSide
          });


          mesh.castShadow = true; //default is false
          mesh.receiveShadow = true; //default


          if (i < 6) {
            this_.paint.push(mesh);
            this_.baseMats[i] = baseMat;
            mesh.material.shininess = 5;
          }
          else if (i == 6) {
            //mesh.material.color.setHex(0x056674);
          }
          else {
            mesh.material.color.setHex(0x056674);
          }

          i++;
        });

        this_.container.add(this_.painting)

        this_.page = document.getElementById("contentBox");
        this_.state = 1 + Math.floor(this_.page.scrollTop / this_.sizes.height - 0.5);
        this_.changeState();
        this_.setMovement()
      },

      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },

      function (error) {
        console.log('An error happened: ' + error);
      }
    );

  }

  setMovement() {
    this.time.on('tick', () => {
      let ratio = this.sizes.width / this.sizes.height
      let mouseX = Mouse.cursor[0];
      let mouseY = Mouse.cursor[1];
      this.mouseX = this.lerp(this.mouseX, (mouseX + 0.5) * Math.PI / 12 * ratio, 0.1);
      this.mouseY = this.lerp(this.mouseY, -mouseY * Math.PI / 12 / ratio, 0.1);
      let scrollProgress = this.page.scrollTop / this.sizes.height;
      let scrollSpin = scrollProgress * Math.PI * 2;

      this.painting.position.y = Math.sin(this.time.current * 0.0015) * 0.02
      this.painting.rotation.y = -Math.PI / 2 + this.mouseX + scrollSpin;
      this.painting.rotation.z = this.mouseY
      let scale = ratio * 0.5;
      this.painting.scale.set(scale, scale, scale);

      let newState = 1 + Math.floor(scrollProgress - 0.5);
      if (this.state != newState) {
        this.state = newState
        this.changeState();
      }

      if (this.state == 2) {
        for (let i = 0; i < this.paint.length; i++) {
          let pos = (0.5 + (Math.sin(i + 0.002 * this.time.current) / 2)) * 0.1;
          this.paint[i].position.x = pos;
        };
      }
      else if (this.state == 3) {
        let blink = 0.5 + (Math.sin(0.003 * this.time.current) / 2)
        for (let i = 0; i < this.paint.length; i++) {
          let p = this.paint[i];
          let baseCol = this.baseMats[i].color;
          let col = this.lerpColor(baseCol.getHexString(), "0xe0ece4", blink)
          p.material.color.setHex(col);
        };
      }
    })
  }

  changeState() {
    let s = this.state
    console.log("state: " + s);
    switch (s) {
      case 0: //STARTER
        for (let i = 0; i < this.paint.length; i++) {
          let p = this.paint[i];
          p.position.x = 0;

          let baseCol = this.baseMats[i].color;
          p.material.color.set(baseCol);
        }
        break;
      case 1: //BLANK
        for (let i = 0; i < this.paint.length; i++) {
          let p = this.paint[i];
          p.material.color.setHex(0xe0ece4);
          p.position.x = 0;
        }
        break;
      case 2: //3D
        for (let i = 0; i < this.paint.length; i++) {
          let p = this.paint[i];
          p.material.color.setHex(0xe0ece4);
        }
        break;
      case 3: //PAINTED
        for (let i = 0; i < this.paint.length; i++) {
          // let p = this.paint[i];
          // let baseCol = this.baseMats[i].color;
          // p.material.color.set(baseCol);
        }
        break;
      case 4: //END
        for (let i = 0; i < this.paint.length; i++) {
          let p = this.paint[i];
          let baseCol = this.baseMats[i].color;
          p.material.color.set(baseCol);
        }
        break;

    }

  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `0x${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  lerp(value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
  }

  lerpColor(a, b, amount) {

    var ah = parseInt(a.replace(/0x/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/0x/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);

    return '0x' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  }

  setDebug() {
    this.debugFolder = this.debug.addFolder('Painting')
    this.debugFolder.open()

    this.debugFolder.add(this.painting.material, 'wireframe').name('Wireframe')
    this.debugFolder
      .add(this.painting.material, 'metalness')
      .step(0.05)
      .min(0)
      .max(1)
      .name('Metalness')
    this.debugFolder
      .add(this.painting.material, 'roughness')
      .step(0.05)
      .min(0)
      .max(1)
      .name('Roughness')
    this.debugFolder
      .addColor(this.params, 'color')
      .name('Color')
      .onChange(() => {
        this.painting.material.color = new THREE.Color(this.params.color)
      })
  }
}
