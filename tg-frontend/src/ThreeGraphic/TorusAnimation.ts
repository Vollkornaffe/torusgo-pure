import autoBind from 'react-autobind';

import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  FaceColors,
  Group,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshFaceMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';


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
const LIGHT_COLOR_DIRECTIONAL = 0x555555;

const STONE_COLOR_BLACK = 0x1a0008;
const STONE_COLOR_WHITE = 0xe6ffff;

const SCORE_COLOR_BLACK = 0x33000f;
const SCORE_COLOR_WHITE = 0xccffff;

const TORUS_COLOR = 0xffcc66;
const LINE_COLOR = 0x000000;

const ORIGIN = new Vector3(0, 0, 0);

export interface ITorusAnimationSetup {
  width: number;
  height: number;
  boardSizeX: number;
  boardSizeY: number;
  radius: number;
  thickness: number;
};

class TorusAnimation {
  private givenSetup: ITorusAnimationSetup;
  private canvas: HTMLCanvasElement;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private torusMaterial: THREE.MeshPhongMaterial;
  private torusGeometry: THREE.BoxGeometry;
  private torusMesh: THREE.Mesh;

  public constructor(
    givenSetup: ITorusAnimationSetup,
    canvas: HTMLCanvasElement,
  ) {
    this.givenSetup = givenSetup;
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({canvas: this.canvas});
    this.renderer.setClearColor(new Color(CLEAR_COLOR), 1);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      CAMERA_FOV,
      this.givenSetup.width / this.givenSetup.height,
      CAMERA_NEAR,
      CAMERA_FAR
    );
    this.scene.add(this.camera);
    this.camera.position.set(5, 0, 0);
    this.camera.lookAt(ORIGIN.clone());
    this.ambientLight = new AmbientLight(LIGHT_COLOR_AMBIENT);
    this.directionalLight = new DirectionalLight(LIGHT_COLOR_DIRECTIONAL);
    this.scene.add(this.ambientLight, this.directionalLight);
    this.directionalLight.position.set(1, 0, 0).normalize();
    this.torusMaterial = new MeshPhongMaterial({
      color: TORUS_COLOR,
      vertexColors: FaceColors,
    });
    this.torusGeometry = new BoxGeometry(1,1,1);
    this.torusMesh = new Mesh(this.torusGeometry, this.torusMaterial);
    this.scene.add(this.torusMesh);

    this.animate();
  }

  public cleanup() {
    this.renderer.dispose();
    this.torusMaterial.dispose();
    this.torusGeometry.dispose();
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

    this.renderer.render(this.scene, this.camera);
  }
}     
      
export default TorusAnimation;
