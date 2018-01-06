import React from 'react'; //TODO stop using react-three-renderer
import autoBind from 'react-autobind';

import {
  Vector3, WebGLRenderer, PerspectiveCamera, MeshPhongMaterial, MeshLambertMaterial, MeshStandardMaterial, Mesh,
  AmbientLight, PointLight, PointLightHelper, DirectionalLight, Group, Scene,
} from 'three';

import CustomTorusGeometry from "../geometry/CustomTorusGeometry";


/**
 * Our main class to display the torus. This only contains view code!
 */
class Animation {

  constructor(options) {
    autoBind(this);

    this.canvas = options.canvas;

    const width = options.width || 100;
    const height = options.height || 100;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas
    });

    this.camera = new PerspectiveCamera(
      75,             // fov
      width / height, // aspect
      0.1,            // near
      1000            // far
    );
    this.camera.position.set(0, 5, 0);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.geometry = new CustomTorusGeometry(
      2,   // radius
      0.5, // thickness
      9,   // XSegments
      9    // YSegments
    );

    this.material = new MeshPhongMaterial();

    this.mesh = new Mesh(this.geometry, this.material);

    this.light = {
      ambient: new AmbientLight(0x333333),
      point: new PointLight(0x000000),
      directional: new DirectionalLight(0x555555)
    };

    this.color_timer = 0;
    this.light.point.position.set(0, 0, 0);
    this.light.directional.position.set(1,0,0).normalize();

    this.torusGroup = new Group();
    this.torusGroup.add(this.mesh);

    this.scene = new Scene();
    this.scene.add(this.torusGroup);
    this.scene.add(this.light.ambient);
    this.scene.add(this.light.point);
    this.scene.add(this.light.directional);
    this.scene.add(this.camera);

    this.playing = false;

    this.delta = {
      x: 0,
      y: 0,
      z: 0,
      twist: 0,
      zoom: 0
    }
  }

  start() {
    if(!this.playing) {
      this.playing = true;
      this.animate();
    }
  }

  stop() {
    cancelAnimationFrame(this.animationHandler);
    this.playing = false;
  }

  reset() {
    this.torusGroup.rotation.set(0,0,0);
  }

  setDelta(delta) {
    this.delta = delta;
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width/height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.animationHandler = requestAnimationFrame(this.animate);

    //Start of animation code

    // fun lights
    this.color_timer += 0.1;
    let red = Math.sin(0.3 * Math.floor(this.color_timer) + 0) ;
    let grn = Math.sin(0.3 * Math.floor(this.color_timer) + 2) ;
    let blu = Math.sin(0.3 * Math.floor(this.color_timer) + 4) ;

    this.light.point.color.setRGB(red,grn,blu);

    this.torusGroup.rotation.x += this.delta.x;
    this.torusGroup.rotation.y += this.delta.y;
    this.torusGroup.rotation.z += this.delta.z;

    if(this.delta.twist) {
      this.geometry.parameters.twist += this.delta.twist;
      this.geometry.updateGeometry();
    }

    //End of animation code

    this.renderer.render(this.scene, this.camera);
  }
}

export default Animation;