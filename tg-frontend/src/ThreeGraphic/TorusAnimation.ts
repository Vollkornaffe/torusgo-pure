import {
  BoxGeometry,
  Color, Matrix4,
  Mesh, MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
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
  twist:      number;
  lineOff:    number;
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

  private torusMaterialWhiteStone: TorusMaterialStone;
  private torusMaterialBlackStone: TorusMaterialStone;
  private torusGeometryStone: BoxGeometry;
  private torusMeshStoneArray: Mesh[];

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
      this.camera.matrixWorld,
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
    this.torusMaterialWhiteStone = new TorusMaterialStone(
      this.camera.matrixWorld,
      new Matrix4(), // identity
      new Color(STONE_COLOR_WHITE),
    );
    this.torusMaterialBlackStone = new TorusMaterialStone(
      this.camera.matrixWorld,
      new Matrix4(), // identity
      new Color(STONE_COLOR_BLACK),
    );

    this.torusMeshBoard = new Mesh(this.torusGeometryBoard, this.torusMaterialBoard);

    this.scene.add(this.torusMeshBoard);
    for (let i = -50; i <= 50; i ++ ) {
      const tempMesh = new Mesh(this.torusGeometryStone, this.torusMaterialWhiteStone);
      tempMesh.scale.set(0.1,0.1,0.05);
      tempMesh.position.add(new Vector3( -0.1,-0.1, i * 0.1));
      this.scene.add(tempMesh);
    }
    this.scene.add(this.torusMeshBoard);
    for (let i = -50; i <= 50; i ++ ) {
      const tempMesh = new Mesh(this.torusGeometryStone, this.torusMaterialBlackStone);
      tempMesh.scale.set(0.1,0.1,0.05);
      tempMesh.position.add(new Vector3( -0.1,0.1, i * 0.1));
      this.scene.add(tempMesh);
    }
    for (let i = -50; i <= 50; i ++ ) {
      const tempMesh = new Mesh(this.torusGeometryStone, this.torusMaterialWhiteStone);
      tempMesh.scale.set(0.1,0.1,0.05);
      tempMesh.position.add(new Vector3( 0.1,0.1, i * 0.1));
      this.scene.add(tempMesh);
    }
    for (let i = -50; i <= 50; i ++ ) {
      const tempMesh = new Mesh(this.torusGeometryStone, this.torusMaterialBlackStone);
      tempMesh.scale.set(0.1,0.1,0.05);
      tempMesh.position.add(new Vector3( 0.1,-0.1, i * 0.1));
      this.scene.add(tempMesh);
    }

    this.animate();
  }

  public cleanup() {
    this.renderer.dispose();
    this.torusMaterialBoard.dispose();
    this.torusMaterialWhiteStone.dispose();
    this.torusMaterialBlackStone.dispose();
    this.torusGeometryBoard.dispose();
    this.torusGeometryStone.dispose();
  }

  public updateTwist(newTwist: number) {
    this.torusMaterialBoard.uniforms.twist.value += newTwist;
  }

  public updateUniforms() {

    // const modelMatrix = this.torusMeshTestStone.matrixWorld.clone();
    // console.log(this.torusMeshTestStone.matrixWorld.elements);
    // const elems : number[] = Array.prototype.slice.call(this.torusMeshTestStone.matrixWorld.elements);
    // console.log(elems);
    // const inverseModelMatrix = new Matrix4();
    // inverseModelMatrix.getInverse(this.torusMeshTestStone.matrixWorld, true);
    // console.log(inverseModelMatrix.elements);
    // this.torusMaterialTestStone.uniforms.inverseModelMatrix.value = this.torusMeshTestStone.matrixWorld;
    // this.torusMaterialTestStone.uniforms.inverseModelMatrix.value = inverseModelMatrix;
  }

  public animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Start of animation code

    // this.updateRotation();
    // this.updateTwist();
    // this.updateStones();
    // this.updateScoring();
    // this.updateRaycast();

    // End of animation code

    // Use Math.cos and Math.sin to set camera X and Z values based on angle.
    this.camera.position.x = 5.0 * Math.cos( this.angle );
    this.camera.position.y = 1.0;
    this.camera.position.z = 5.0 * Math.sin( this.angle );
    this.camera.lookAt(0.0,0.0,0.0);
    this.angle += 0.005;
    // this.torusMaterialBoard.uniforms.twist.value = this.angle;

    this.renderer.render(this.scene, this.camera);
  }
}     
      
export default TorusAnimation;
