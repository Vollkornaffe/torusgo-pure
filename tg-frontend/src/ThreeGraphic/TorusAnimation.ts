import {
  AxesHelper,
  BoxGeometry,
  Color, Matrix4,
  Mesh, MeshBasicMaterial,
  PerspectiveCamera,
  Scene, Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import TorusMaterialBoard from './TorusMaterialBoard';
import TorusMaterialStone from "./TorusMaterialStone";

const DELTA_X = 0.1;
const DELTA_Y = 0.1;
const DELTA_Z = 0.05;

const DELTA_TWIST = 0.1;

const CAMERA_RADIUS = 5;
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

const CLEAR_COLOR = 0x4286f4;
const LIGHT_COLOR_AMBIENT = 0x333333;
const LIGHT_COLOR_DIRECTIONAL = 0x555555;

const STONE_COLOR_BLACK = 0x1a0008;
const STONE_COLOR_WHITE = 0xe6ffff;

const SCORE_COLOR_BLACK = 0x33000f;
const SCORE_COLOR_WHITE = 0xccffff;

const TORUS_COLOR = 0xFF6B00;
const LINE_COLOR = 0x000000;

const ORIGIN = new Vector3(0, 0, 0);

export interface ITorusAnimationSetup {
  width:      number;
  height:     number;
  boardSizeX: number;
  boardSizeY: number;
  radius:     number;
  thickness:  number;
  stoneSize:  number;
  twist:      number;
}

class TorusAnimation {
  private givenSetup: ITorusAnimationSetup;
  private canvas: HTMLCanvasElement;

  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;

  private angle: number;
  private torusMaterialBoard: TorusMaterialBoard;
  private torusGeometryBoard: BoxGeometry;
  private torusMeshBoard: Mesh;

  // todo make shallow copies of these two materials
  // private torusMaterialWhiteStone: TorusMaterialStone;
  // private torusMaterialBlackStone: TorusMaterialStone;
  private torusStoneColorWhite = new Color(STONE_COLOR_WHITE);
  private torusStoneColorBlack = new Color(STONE_COLOR_BLACK);
  private torusGeometryStone: BoxGeometry;
  private torusMeshStoneArray: Mesh[];
  private torusMaterialStoneArray: TorusMaterialStone[];

  private torusStoneStates: number[];

  public constructor(
    givenSetup: ITorusAnimationSetup,
    canvas: HTMLCanvasElement,
  ) {
    this.givenSetup = givenSetup;
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({canvas: this.canvas});

    this.renderer.getContext().getExtension('EXT_frag_depth');
    let supportedExtensions = this.renderer.getContext().getSupportedExtensions();
    if (supportedExtensions == null) {
      supportedExtensions = [];
    }

    if (-1 === supportedExtensions.indexOf('EXT_frag_depth')) {
      alert('EXT_frag_depth extension not supported! 3D view not available!');
    }


    this.renderer.setClearColor(new Color(CLEAR_COLOR), 1);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      CAMERA_FOV,
      this.givenSetup.width / this.givenSetup.height,
      CAMERA_NEAR,
      CAMERA_FAR
    );
    this.scene.add(this.camera);
    this.camera.up.set(0, 1, 0);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(ORIGIN.clone());

    this.angle = Math.PI;


    this.torusGeometryBoard = new BoxGeometry(
      2.0*(this.givenSetup.radius + this.givenSetup.thickness),
      2.0*(this.givenSetup.radius + this.givenSetup.thickness),
      2.0*this.givenSetup.thickness,
    );
    this.torusMaterialBoard = new TorusMaterialBoard(
      this.givenSetup.boardSizeX,
      this.givenSetup.boardSizeY,
      this.givenSetup.radius,
      this.givenSetup.thickness,
      this.givenSetup.twist,
      new Color(TORUS_COLOR),
    );
    this.torusGeometryStone = new BoxGeometry(
      2.0,2.0,2.0,
    );

    this.torusMeshBoard = new Mesh(this.torusGeometryBoard, this.torusMaterialBoard);

    this.scene.add(this.torusMeshBoard);

    // create a 'potential' stone for each field
    this.torusMeshStoneArray = [];
    this.torusMaterialStoneArray = [];
    this.torusStoneStates = [];
    for (let i = 0; i < this.givenSetup.boardSizeX; i++) {
      for (let j = 0; j < this.givenSetup.boardSizeY; j++) {
        const tempMaterial =  new TorusMaterialStone( this.torusStoneColorWhite );
        const tempMesh = new Mesh(this.torusGeometryStone, tempMaterial);
        this.torusMaterialStoneArray.push(tempMaterial);
        this.torusMeshStoneArray.push(tempMesh);
        this.torusStoneStates.push(i*j % 3);

        tempMesh.visible = false;
        this.scene.add(tempMesh);
      }
    }

    this.scene.add(new AxesHelper());
    this.animate();
  }

  public cleanup() {
    this.renderer.dispose();
    this.torusMaterialBoard.dispose();
    this.torusGeometryBoard.dispose();
    this.torusGeometryStone.dispose();
    for (const material of this.torusMaterialStoneArray) {
      material.dispose();
    }
  }

  public updateTwist(newTwist: number) {
    this.torusMaterialBoard.uniforms.twist.value += newTwist;
  }

  // updates stone transformation
  private updateStones() {
    const scaleX = (this.givenSetup.thickness + this.givenSetup.stoneSize)
      * Math.PI / this.givenSetup.boardSizeX * 0.9; // the 0.9 enables a small gap
    let   scaleY; // to be determined for each iRad
    const scaleZ = this.givenSetup.stoneSize;

    let stoneId = 0;
    const xAxis = new Vector3(1,0,0);
    const yAxis = new Vector3(0,1,0);
    const zAxis = new Vector3(0,0,1);
    for (let i = 0; i < this.givenSetup.boardSizeX; i++) {
      const iRad = i / this.givenSetup.boardSizeX * 2 * Math.PI + this.givenSetup.twist;
      const offset = new Vector3(
        (this.givenSetup.thickness + scaleZ) * Math.sin(iRad),
        0,
        (this.givenSetup.thickness + scaleZ) * Math.cos(iRad),
      );

      const innerRingRadius = this.givenSetup.radius
        + (this.givenSetup.thickness + scaleZ) * Math.cos(iRad - Math.PI/2.0);
      scaleY = innerRingRadius * Math.PI / this.givenSetup.boardSizeY * 0.9; // the 0.9 enables a small gap

      for (let j = 0; j < this.givenSetup.boardSizeY; j++) {
        const jRad = j / this.givenSetup.boardSizeY * 2 * Math.PI;

        const mesh     = this.torusMeshStoneArray[stoneId];
        const material = this.torusMaterialStoneArray[stoneId];

        mesh.setRotationFromMatrix(
          new Matrix4().makeRotationZ(jRad)
          .multiply(new Matrix4().makeRotationY(iRad)));

        // const widthFactor = (iRad - Math.PI * 0.5)
        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.position.copy(offset);
        mesh.position.addScaledVector(xAxis, this.givenSetup.radius);
        mesh.position.applyAxisAngle(zAxis, jRad);

        stoneId++;
      }
    }
  }

  // updates Matrices passed to shader
  // also updates visibility and color of stones
  private updateUniforms() {

    /* Somehow this doesn't work.
    for (const stoneMesh of this.torusMeshStoneArray) {
      stoneMesh.material.uniforms.inverseModelMatrix.value = customInverse(stoneMesh.matrixWorld);
    }
    */

    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
    this.torusMeshBoard.updateMatrixWorld(true);

    // Viewport, View and Projection matrix is the same for all objects
    const viewPort                = new Vector2(this.givenSetup.width, this.givenSetup.height);
    const inverseViewMatrix       = this.camera.matrixWorld;
    const inverseProjectionMatrix = new Matrix4().getInverse(this.camera.projectionMatrix);

    // now just for the board
    const inverseModelMatrixBoard           = new Matrix4().getInverse(this.torusMeshBoard.matrixWorld);
    const transposedInverseModelMatrixBoard = inverseModelMatrixBoard.clone().transpose();

    this.torusMaterialBoard.uniforms.viewPort.value                     = viewPort;
    this.torusMaterialBoard.uniforms.inverseViewMatrix.value            = inverseViewMatrix;
    this.torusMaterialBoard.uniforms.inverseProjectionMatrix.value      = inverseProjectionMatrix;
    this.torusMaterialBoard.uniforms.inverseModelMatrix.value           = inverseModelMatrixBoard;
    this.torusMaterialBoard.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrixBoard;

    // now for all the stones
    for (let i = 0; i < this.torusMeshStoneArray.length; i++ ) {
      const mesh     = this.torusMeshStoneArray[i];
      const material = this.torusMaterialStoneArray[i];
      const state    = this.torusStoneStates[i];

      mesh.updateMatrixWorld(true);

      const inverseModelMatrix           = new Matrix4().getInverse(mesh.matrixWorld);
      const transposedInverseModelMatrix = inverseModelMatrix.clone().transpose();

      material.uniforms.viewPort.value                     = viewPort;
      material.uniforms.inverseViewMatrix.value            = inverseViewMatrix;
      material.uniforms.inverseProjectionMatrix.value      = inverseProjectionMatrix;
      material.uniforms.inverseModelMatrix.value           = inverseModelMatrix;
      material.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrix;

      switch(state) {
        case 0: mesh.visible = false; break;
        case 1: {
          mesh.visible = true;
          material.uniforms.stoneColor.value = this.torusStoneColorBlack;
          break;
        }
        case 2: {
          mesh.visible = true;
          material.uniforms.stoneColor.value = this.torusStoneColorWhite;
          break;
        }
      }
    }

  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.updateStones();
    this.updateUniforms();

    // Start of animation code

    // this.updateRotation();
    // this.updateTwist();
    // this.updateStones();
    // this.updateScoring();
    // this.updateRaycast();

    // End of animation code

    // Use Math.cos and Math.sin to set camera X and Z values based on angle.
    this.camera.position.x = 5.0 * Math.cos( this.angle );
    this.camera.position.y = 0.0;
    this.camera.position.z = 5.0 * Math.sin( this.angle );
    this.camera.lookAt(0.0,0.0,0.0);
    this.angle += 0.005;
    // this.torusMaterialBoard.uniforms.twist.value = this.angle;

    this.renderer.render(this.scene, this.camera);
  }
}     
      
export default TorusAnimation;
