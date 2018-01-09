'use strict';
import React from 'react'; //TODO stop using react-three-renderer
import autoBind from 'react-autobind';

import {
  FaceNormalsHelper, Raycaster, Vector2, Vector3,
  WebGLRenderer, PerspectiveCamera,
  MeshFaceMaterial, MeshPhongMaterial, MeshLambertMaterial, MeshStandardMaterial, Mesh,
  AmbientLight, PointLight, PointLightHelper, DirectionalLight, Group, Scene,
} from 'three';

import CustomTorusGeometry from "../geometry/CustomTorusGeometry";

/**
 * maybe solution to the memory leaks
 */
function disposeNode (node)
{
  if (node instanceof Mesh)
  {
    if (node.geometry)
    {
      node.geometry.dispose ();
    }

    if (node.material)
    {
      if (node.material instanceof MeshFaceMaterial)
      {
        node.material.materials.forEach((mtrl)=>
        {
          if (mtrl.map)           mtrl.map.dispose ();
          if (mtrl.lightMap)      mtrl.lightMap.dispose ();
          if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
          if (mtrl.normalMap)     mtrl.normalMap.dispose ();
          if (mtrl.specularMap)   mtrl.specularMap.dispose ();
          if (mtrl.envMap)        mtrl.envMap.dispose ();

          mtrl.dispose ();    // disposes any programs associated with the material
        });
      }
      else
      {
        if (node.material.map)          node.material.map.dispose ();
        if (node.material.lightMap)     node.material.lightMap.dispose ();
        if (node.material.bumpMap)      node.material.bumpMap.dispose ();
        if (node.material.normalMap)    node.material.normalMap.dispose ();
        if (node.material.specularMap)  node.material.specularMap.dispose ();
        if (node.material.envMap)       node.material.envMap.dispose ();

        node.material.dispose ();   // disposes any programs associated with the material
      }
    }
  }
}   // disposeNode

function disposeHierarchy (node, callback)
{
  for (let i = node.children.length - 1; i >= 0; i--)
  {
    let child = node.children[i];
    disposeHierarchy (child, callback);
    callback (child);
  }
}

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
      1.5, // thickness
      100,   // XSegments
      100    // YSegments
    );

    this.material = new MeshPhongMaterial();
    //this.material.wireframe = true;

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

    this.raycaster = new Raycaster();
    this.cursor = new Vector2();

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
    window.removeEventListener('mousemove', this.onMouseMove);
    cancelAnimationFrame(this.animationHandler);
    this.playing = false;
    this.renderer.dispose();
    while(this.scene.children.length > 0){
      disposeHierarchy(this.scene.children[0], disposeNode);
      this.scene.remove(this.scene.children[0]);
    }
  }

  reset() {
    this.torusGroup.rotation.set(0,0,0);
    this.geometry.parameters.twist = 0.0;
  }

  setDelta(delta) {
    this.delta = delta;
  }

  setCursor(cursor) {
    this.cursor.set(
      cursor.x * 2 / this.renderer.getSize().width - 1,
      cursor.y * 2 / this.renderer.getSize().height - 1
    );
    console.log(cursor);
    this.raycaster.setFromCamera(this.cursor, this.camera);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width/height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.animationHandler = requestAnimationFrame(this.animate);

    //Start of animation code

    let intersects = this.raycaster.intersectObject( this.mesh);

    this.mesh.material.color.set( 0x00ff00 );
    intersects.forEach((intersection)=> {
      intersection.object.material.color.set( 0xff0000 );
    });

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