'use strict';
import React from 'react';
import autoBind from 'react-autobind';
import textureFile from '../resources/field_with_lines.jpg';

import {
  Raycaster, Vector2, Vector3,
  WebGLRenderer, PerspectiveCamera,
  BoxGeometry,
  MeshFaceMaterial, MeshPhongMaterial, Mesh,
  AmbientLight, PointLight, DirectionalLight, Group, Scene, FaceColors, VertexColors, FaceNormalsHelper,
  LineBasicMaterial, LineSegments, TextureLoader, MeshBasicMaterial, Color,
} from 'three';

import CustomTorusGeometry from "../geometry/CustomTorusGeometry";
import TorusLinesGeometry from "../geometry/TorusLinesGeometry";

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
          if (mtrl.specularMap)   mtrl.specularMap.dispose ()
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



const DELTA_X = 0.1;
const DELTA_Y = 0.1;
const DELTA_Z = 0.05;

const DELTA_TWIST = 0.1;

const CAMERA_RADIUS = 5;
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

const CLEAR_COLOR = 0x4286f4;
const LIGHT_COLOR_AMBIENT = 0x333333;
const LIGHT_COLOR_POINT = 0x000000;
const LIGHT_COLOR_DIRECTIONAL = 0x555555;

const STONE_COLOR_BLACK = 0x1a0008;
const STONE_COLOR_WHITE = 0xe6ffff;

const SCORE_COLOR_BLACK = 0x33000f;
const SCORE_COLOR_WHITE = 0xccffff;

const TORUS_COLOR = 0xffcc66;
const LINE_COLOR = 0x000000;


const ORIGIN = new Vector3(0,0,0);

/**
 * Our main class to display the torus. This only contains view code!
 */
class Animation {

  constructor(options) {
    autoBind(this);

    this.boardSize = options.boardSize;
    this.boardState = options.boardState;

    this.canvas = options.canvas;

    this.width = options.width || 100;
    this.height = options.height || 100;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas
    });
    this.renderer.setClearColor(new Color(CLEAR_COLOR), 1);

    this.scene = new Scene();

    this.initCamera();
    this.initLights();

    this.initTorus();
    this.initStones();

    this.raycaster = new Raycaster();

    this.cursor = new Vector2();

    this.delta = {
      x: 0,
      y: 0,
      z: 0,
      twist: 0,
      zoom: 0
    };

    this.selectedField = null;

    this.playing = false;

    this.stonesNeedUpdate = false;
    this.scoringNeedsUpdate = false;

    //this.helper = new FaceNormalsHelper( this.torusMesh, 0.5, 0x00ff00, 1 );
    //this.scene.add( this.helper );
  }

  initCamera() {
    this.camera = new PerspectiveCamera(CAMERA_FOV, this.width / this.height, CAMERA_NEAR, CAMERA_FAR
    );
    this.scene.add(this.camera);

    this.camera.position.set(5, 0, 0);
    this.camera.lookAt(ORIGIN.clone());
  }

  initLights() {
    this.light = {
      ambient: new AmbientLight(LIGHT_COLOR_AMBIENT),
      directional: new DirectionalLight(LIGHT_COLOR_DIRECTIONAL)
      //point: new PointLight(LIGHT_COLOR_POINT),
    };
    this.scene.add(this.light.ambient, this.light.directional /*, this.light.point */);

    //this.light.point.position.set(0, 0, 0);
    this.light.directional.position.set(1,0,0).normalize();

  }

  initTorus() {
    this.torusGroup = new Group();
    this.scene.add(this.torusGroup);

    //this.texture = new TextureLoader().load(textureFile);
    this.torusMaterial = new MeshPhongMaterial({ color: TORUS_COLOR, vertexColors: FaceColors });
    //this.torusMaterial = new MeshPhongMaterial({ map: this.texture });
    //this.torusMaterial.wireframe = true;
    this.lineMaterial = new LineBasicMaterial({ color: LINE_COLOR, linewidth: 1 , linecap: 'round'});

    this.customTorusGeometry = new CustomTorusGeometry(
      this.boardSize.x,   // XSegments
      this.boardSize.y    // YSegments
    );
    //this.customTorusGeometry = new BoxGeometry(1,1,1);
    this.torusLinesGeometry = new TorusLinesGeometry(this.customTorusGeometry);

    this.torusMesh = new Mesh(this.customTorusGeometry, this.torusMaterial);
    this.lineMesh = new LineSegments(this.torusLinesGeometry, this.lineMaterial);

    this.torusGroup.add(this.torusMesh);
    this.torusGroup.add(this.lineMesh);
  }

  initStones() {
    this.stoneGroup = new Group();
    this.scene.add(this.stoneGroup);

    this.blackStoneMaterial = new MeshPhongMaterial({color: STONE_COLOR_BLACK});
    this.whiteStoneMaterial = new MeshPhongMaterial({color: STONE_COLOR_WHITE});

    this.stoneGeometry = new BoxGeometry(1,1,1);

    this.addStones();
  }

  removeStones() {
    let children = this.stoneGroup.children;
    while(children.length) {
      this.stoneGroup.remove(children[0]);
    }
  }

  addScoring() {
    let vId = 0;
    for (let i = 0; i < this.boardSize.x; i++) {
      for (let j = 0; j < this.boardSize.y; j++) {

        let curField = this.scoringMarks[vId];
        let fieldColor = TORUS_COLOR;
        if (curField !== 0) {
          fieldColor = curField === 1 ? SCORE_COLOR_BLACK : SCORE_COLOR_WHITE;
        }
        this.customTorusGeometry.quads[vId].setColorHex(fieldColor);

        vId++;
      }
    }
    this.customTorusGeometry.colorsNeedUpdate = true;
  }

  /**
   * TODO: we don't need to re-add stones all the time,
   * every field can just have its own stone, the position can be even the same object
   * as in the torus geometry
   * and if the stone changes color/vanishes, just change the material
   */
  addStones() {
    let vId = 0;
    for (let i = 0; i < this.boardSize.x; i++) {
      for (let j = 0; j < this.boardSize.y; j++) {

        let curField = this.boardState[vId];
        if (curField !== 0) {
          let newStone = new Mesh(
            this.stoneGeometry,
            curField === 1 ? this.blackStoneMaterial : this.whiteStoneMaterial
          );

          //newStone.position.copy(this.customTorusGeometry.quads[vId].position);
          newStone.position.copy(this.customTorusGeometry.quads[vId].discreteMid);
          let newScale = this.customTorusGeometry.quads[vId].discreteScale;
          newStone.scale.set(newScale, newScale, newScale);

          this.stoneGroup.add(newStone);
        }

        vId++;
      }
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
    this.renderer.dispose();
    while(this.scene.children.length > 0){
      disposeHierarchy(this.scene.children[0], disposeNode);
      this.scene.remove(this.scene.children[0]);
    }
  }

  reset() {
    this.torusGroup.rotation.set(0,0,0);
    this.customTorusGeometry.parameters.twist = 0.0;
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width/height;
    this.camera.updateProjectionMatrix();
  }

  setDelta(delta) {
    this.delta = delta;
  }

  setCursor(cursor) {
    this.cursor.set(
      cursor.x * 2 / this.renderer.getSize().width - 1,
      -cursor.y * 2 / this.renderer.getSize().height + 1
    );
  }

  setBoardState(boardState) {
    this.boardState = boardState;
    this.stonesNeedUpdate = true;
  }

  setScoringMarks(marks) {
    this.scoringMarks = marks;
    this.scoringNeedsUpdate = true;
  }

  getSelectedField() {
    return this.selectedField;
  }

  updateRotation() {

    let pos = this.camera.position;
    let up = this.camera.up;

    let x = (new Vector3()).crossVectors(up, pos).normalize();
    let y = up;

    pos.addScaledVector(x, this.delta.x * DELTA_X);
    pos.addScaledVector(y, this.delta.y * DELTA_Y);

    pos.normalize();

    let newNormal = pos.clone();

    pos.multiplyScalar(CAMERA_RADIUS);

    let diff = newNormal.multiplyScalar(up.dot(newNormal));

    up.sub(diff).normalize();

    this.light.directional.position.copy(pos);

    this.camera.lookAt(new Vector3(0, 0, 0));

    up.applyAxisAngle(pos.clone().normalize(), this.delta.z * DELTA_Z);
  }

  updateTwist() {
    if(this.delta.twist) {
      this.customTorusGeometry.parameters.twist += this.delta.twist * DELTA_TWIST;
      this.customTorusGeometry.updateGeometry();
      this.torusLinesGeometry.updateGeometry(this.customTorusGeometry);
      // this.helper.update();
      this.stonesNeedUpdate = true;
    }
  }

  updateStones() {
    if(this.stonesNeedUpdate) {
      this.stonesNeedUpdate = false;

      this.removeStones();
      this.addStones();
    }
  }

  updateScoring() {
    if(this.scoringNeedsUpdate) {
      this.scoringNeedsUpdate = false;

      this.addScoring();
    }
  }

  updateRaycast() {
    this.raycaster.setFromCamera(this.cursor, this.camera);

    let intersects = this.raycaster.intersectObject( this.torusMesh);

    if(intersects.length > 0) {
      let quad = intersects[0].face.quad;
      //quad.setColorRGB( Math.random(), Math.random(), Math.random() );
      //this.customTorusGeometry.colorsNeedUpdate = true;

      this.selectedField = {
        x: quad.x,
        y: quad.y
      };
    } else {
      this.selectedField = null;
    }
  }

  animate() {
    this.animationHandler = requestAnimationFrame(this.animate);

    //Start of animation code

    this.updateRotation();
    this.updateTwist();
    this.updateStones();
    this.updateScoring();
    this.updateRaycast();

    //End of animation code

    this.renderer.render(this.scene, this.camera);
  }
}

export default Animation;