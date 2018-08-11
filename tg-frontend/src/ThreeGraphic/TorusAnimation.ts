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
  TorusBufferGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import TorusGeometryFaces from './TorusGeometryFaces';
import TorusGeometryGeneral from './TorusGeometryGeneral';
import TorusGeometryLines from './TorusGeometryLines';
// import TorusGeometryRaycast from './TorusGeometryRaycast';

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
  width:      number;
  height:     number;
  boardSizeX: number;
  boardSizeY: number;
  radius:     number;
  thickness:  number;
  twist:      number;
  lineOff:    number;
};

class TorusAnimation {
  private givenSetup: ITorusAnimationSetup;
  private canvas: HTMLCanvasElement;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  private torusMaterialFaces: THREE.MeshPhongMaterial;
  private torusMaterialLines: THREE.LineBasicMaterial;

  // private torusGeometry: THREE.BoxGeometry;
  private torusGeometryGeneral: TorusGeometryGeneral;
  private torusGeometryFaces: TorusGeometryFaces;
  private torusGeometryLines: TorusGeometryLines;
  // private torusGeometryRaycast: TorusGeometryRaycast;

  private torusMeshFaces: THREE.Mesh;
  private torusMeshLines: THREE.LineSegments;
  // private torusMeshRaycast: THREE.Mesh;

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
    this.torusMaterialFaces = new MeshPhongMaterial({
      color: TORUS_COLOR,
      vertexColors: FaceColors,
    });
    this.torusMaterialFaces = new MeshPhongMaterial({ color: TORUS_COLOR });

    this.torusMaterialLines = new LineBasicMaterial({
      color: LINE_COLOR,
      linewidth: 1,
      linecap: 'round',
    });

    this.torusGeometryGeneral = new TorusGeometryGeneral(
      givenSetup.boardSizeX,
      givenSetup.boardSizeY,
      givenSetup.radius,
      givenSetup.thickness,
      givenSetup.twist,
      givenSetup.lineOff,
    );
    this.torusGeometryFaces = new TorusGeometryFaces(this.torusGeometryGeneral);
    this.torusGeometryLines = new TorusGeometryLines(this.torusGeometryGeneral);
    // this.torusGeometryRaycast = new TorusGeometryRaycast(this.torusGeometryGeneral);

    this.torusMeshFaces = new Mesh(this.torusGeometryFaces, this.torusMaterialFaces);
    this.torusMeshLines = new LineSegments(this.torusGeometryLines, this.torusMaterialLines);
    // this.torusMeshRaycast = new Mesh(this.torusGeometryFancy, this.torusMaterialFancy);

    // this.torusMeshFancy.rotation.y = Math.PI / 2;
    // this.torusMeshFancy.geometry.computeVertexNormals();

    // this.scene.add(this.torusMeshFaces);
    this.scene.add(this.torusMeshLines);
    // this.scene.add(this.torusMeshRaycast);

    this.animate();
  }

  public cleanup() {
    this.renderer.dispose();
    this.torusMaterialFaces.dispose();
    this.torusMaterialLines.dispose();
    this.torusGeometryFaces.dispose();
    this.torusGeometryLines.dispose();
    this.torusGeometryGeneral.dispose();
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

    this.torusGeometryGeneral.update();
    this.torusGeometryFaces.update();
    this.torusGeometryLines.update();

    this.renderer.render(this.scene, this.camera);
  }
}     
      
export default TorusAnimation;
