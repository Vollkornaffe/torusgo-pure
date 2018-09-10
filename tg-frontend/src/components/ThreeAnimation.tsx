import * as React from 'react';
import autoBind from 'react-autobind';
import * as ReactDOM from 'react-dom';

import {
  AxesHelper,
  BoxGeometry, Color, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector2, Vector3, Vector4,
  WebGLRenderer
} from "three";
import TorusMaterialBoard from "../ThreeGraphic/TorusMaterialBoard";
import TorusMaterialStone from "../ThreeGraphic/TorusMaterialStone";

import RayCast from "../ThreeGraphic/RayCast";
import RayCastTorus from "../ThreeGraphic/RayCastTorus";

export interface IKeyboardControls {
  cameraDeltaX: number,
  cameraDeltaY: number,
  twistDelta: number,
  mouseControl: boolean,
}

export interface IProps {
  // current control via keyboard
  keyboardControls: IKeyboardControls,

  // size and offset of viewPort
  width:      number,
  height:     number,
  offsetX:    number,
  offsetY:    number,

  // number of fields
  boardSizeX: number,
  boardSizeY: number,

  // torus and stone dimensions
  radius:     number,
  thickness:  number,
  stoneSize:  number,

  // key states
  // ?

  // 0: empty, 1: white, 2: black, 3: aiming mouse here ?
  boardState: number[],
}

// colors are const
const colorClear = new Color(0x4286f4);
const colorBoard = new Color(0xFF6B00);
const colorStoneWhite = new Color(0xe6ffff);
const colorStoneBlack = new Color(0x1a0008);
const colorStoneHover = new Color(0xFFD700);
const box222 = new BoxGeometry(2,2,2) ;

class ThreeAnimation extends React.Component<IProps> {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private requestId: number; // given by requestAnimationFrame

  private camera: PerspectiveCamera;
  private twist: number;

  private boardGeometry: BoxGeometry; // torus cannot be scaled to box222?
  private boardMaterial: TorusMaterialBoard;
  private boardMesh: Mesh;
  private stoneMaterialArray: TorusMaterialStone[];
  private stoneMeshArray: Mesh[];

  private inCanvas: boolean; // whether the mouse was detected over the canvas
  private mousePos: Vector2; // current mouse pos in canvas, domain: [[-1,-1],[1,1]]

  // these are needed for CPU and GPU sided raytracing.
  private inverseViewMatrix: Matrix4;
  private inverseProjectionMatrix: Matrix4;
  private inverseModelMatrixBoard: Matrix4;

  // result of the CPU sided raytracing, i.e. field that is mouseovered
  private focusedField: number;

  // nothing much happening in constructor
  // first canvas needs to be created
  public constructor(props: IProps) {
    super(props);
    autoBind(this);
  }

  public componentDidMount() {
    this.scene = new Scene();

    this.initRenderer();
    this.initCamera();
    this.initTwist();
    this.initMouse();
    this.setupStoneArrays();
    this.updateBoardTransform();

    this.scene.add(new AxesHelper());

    this.animate();

    // for raycasting:
    document.addEventListener('mousemove', this.updateMousePos);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.width !== prevProps.width
    ||  this.props.height !== prevProps.height) {
      this.updateViewport();
    }

    if (this.props.boardSizeX !== prevProps.boardSizeX
    ||  this.props.boardSizeY !== prevProps.boardSizeY) {
      this.cleanUpStones();
      this.setupStoneArrays();
    }

    if (this.props.radius !== prevProps.radius
    ||  this.props.thickness !== prevProps.thickness) {
      this.cleanUpBoard();
      this.updateBoardTransform();
    }
  }

  public componentWillUnmount() {
    this.cleanUp();
    document.removeEventListener('mousemove', this.updateMousePos);
  }

  public render() {
    const {width, height, offsetX, offsetY} = this.props;
    return <div style={{
      position: 'absolute',
      left: offsetX,
      top: offsetY,
      width,
      height,
    }}>
      <canvas
        tabIndex={1}
        width={width}
        height={height}
        ref={(canvas) => this.canvas = canvas!}
      />
    </div>;
  }

  // Raycasting on CPU side, for detecting focused field
  private updateMousePos(event: MouseEvent) {
    if (event.clientX - this.props.offsetX > 0
    &&  event.clientX - this.props.offsetX < this.props.width
    &&  event.clientY - this.props.offsetY > 0
    &&  event.clientY - this.props.offsetY < this.props.height) {
      this.mousePos.x = 2.0*(event.clientX - this.props.offsetX) / this.props.width - 1.0;
      this.mousePos.y = 2.0*(this.props.offsetY - event.clientY) / this.props.height + 1.0;
      this.inCanvas = true;
    } else {
      this.inCanvas = false;
    }
  }

  private updateHover() {
    const [cameraPosOC, rayDirectionOC] = RayCast(
      this.mousePos,
      this.camera.position,
      this.inverseProjectionMatrix,
      this.inverseViewMatrix,
      this.inverseModelMatrixBoard);
    const distance = RayCastTorus(
      cameraPosOC,
      rayDirectionOC,
      new Vector2(this.props.radius, this.props.thickness));

    // check if torus is hit
    if (distance < 0) {
      this.focusedField = -1;
      return;
    }

    // now compute which field is hit with trigonometry... yeah!
    const hitPosOC = cameraPosOC.addScaledVector(rayDirectionOC, distance);

    let theta = Math.atan2(hitPosOC.y, hitPosOC.x);
    if (theta < 0) {theta += 2.0*Math.PI;}

    // we have to roatate back
    const rotationMat = new Matrix4().makeRotationZ(-theta);
    hitPosOC.applyMatrix4(rotationMat);
    hitPosOC.x -= this.props.radius;

    let phi = Math.atan2(hitPosOC.x, hitPosOC.z);
    if (phi < 0) {phi += 2.0*Math.PI;}

    // sub twist and renormalize
    phi -= this.twist;
    while (phi < 0) {phi += 2.0*Math.PI;}
    while (phi > 2.0*Math.PI) {phi -= 2.0*Math.PI;}

    // calculate the indices on a 2d-array
    let i = Math.round(phi / (2.0*Math.PI / this.props.boardSizeX));
    let j = Math.round(theta / (2.0*Math.PI / this.props.boardSizeY));

    if (i === this.props.boardSizeX) { i = 0; }
    if (j === this.props.boardSizeY) { j = 0; }

    this.focusedField = j + i * this.props.boardSizeY;
  }

  // Here all the animation related functions follow

  private animate() {
    this.requestId = requestAnimationFrame(this.animate.bind(this));

    this.updateStoneTransforms();
    if (document.activeElement === this.canvas) {
      this.updateTwistKeyboard();
      this.updateCameraTrackballKeyboard();
    }

    this.updateRayCastingMatrices();

    if (this.inCanvas) {
      this.updateHover();
    }
    this.updateUniforms();

    this.renderer.render(this.scene, this.camera);
  }

  private initRenderer() {
    this.renderer = new WebGLRenderer({canvas: this.canvas});
    this.renderer.getContext().getExtension('EXT_frag_depth');
    let supportedExtensions = this.renderer.getContext().getSupportedExtensions();
    if (supportedExtensions == null) {
      supportedExtensions = [];
    }
    if (-1 === supportedExtensions.indexOf('EXT_frag_depth')) {
      alert('EXT_frag_depth extension not supported! 3D view not available!');
    }
    this.renderer.setClearColor(colorClear, 1);
  }

  private initTwist() {
    this.twist = 0;
  }

  private initMouse() {
    this.mousePos = new Vector2();
  }

  private initCamera() {
    this.camera = new PerspectiveCamera(
      45, this.props.width/this.props.height, 0.1, 100
    );
    this.camera.up.set(0,1,0);
    this.camera.position.set(0,0,this.props.radius * 4.0);
    this.camera.lookAt(0,0,0);
    this.scene.add(this.camera);
  }

  private cleanUp() {
    this.renderer.dispose();
    this.cleanUpStones();
    box222.dispose(); // this one kinda special
    this.cleanUpBoard();

    cancelAnimationFrame(this.requestId);
  }

  private cleanUpBoard() {
    this.scene.remove(this.boardMesh);
    this.boardGeometry.dispose();
    this.boardMaterial.dispose();
  }

  private cleanUpStones() {
    for (const mesh of this.stoneMeshArray) { this.scene.remove(mesh); }
    for (const material of this.stoneMaterialArray) { material.dispose(); }
    this.stoneMeshArray = [];
    this.stoneMaterialArray = [];
  }

  private updateViewport() {
    this.camera.aspect = this.props.width / this.props.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.props.width, this.props.height );
  }

  private setupStoneArrays() {
    this.stoneMaterialArray = [];
    this.stoneMeshArray = [];
    for (let i=0; i < this.props.boardSizeX; i++) {
      for (let j=0; j < this.props.boardSizeY; j++) {
        const material = new TorusMaterialStone();
        const mesh = new Mesh(box222, material);
        this.stoneMaterialArray.push(material);
        this.stoneMeshArray.push(mesh);
        this.scene.add(mesh);
      }
    }
  }

  private updateBoardTransform() {
    this.boardGeometry = new BoxGeometry(
      2.0*(this.props.radius + this.props.thickness),
      2.0*(this.props.radius + this.props.thickness),
      2.0*this.props.thickness
    );
    this.boardMaterial = new TorusMaterialBoard();
    this.boardMesh = new Mesh(this.boardGeometry, this.boardMaterial);
    this.scene.add(this.boardMesh);
  }


  private updateStoneTransforms() {
    const scaleX = (this.props.thickness + this.props.stoneSize)
      * Math.PI / this.props.boardSizeX * 0.9; // the 0.9 enables a small gap
    let   scaleY; // to be determined for each iRad
    const scaleZ = this.props.stoneSize;

    let stoneId = 0;
    const xAxis = new Vector3(1,0,0);
    const yAxis = new Vector3(0,1,0);
    const zAxis = new Vector3(0,0,1);
    for (let i = 0; i < this.props.boardSizeX; i++) {
      const iRad = i / this.props.boardSizeX * 2 * Math.PI + this.twist;
      const offset = new Vector3(
        (this.props.thickness + scaleZ) * Math.sin(iRad),
        0,
        (this.props.thickness + scaleZ) * Math.cos(iRad),
      );

      const innerRingRadius = this.props.radius
        + (this.props.thickness + scaleZ) * Math.cos(iRad - Math.PI/2.0);
      scaleY = innerRingRadius * Math.PI / this.props.boardSizeY * 0.9; // the 0.9 enables a small gap

      for (let j = 0; j < this.props.boardSizeY; j++) {
        const jRad = j / this.props.boardSizeY * 2 * Math.PI;


        const mesh     = this.stoneMeshArray[stoneId];

        mesh.setRotationFromMatrix(
          new Matrix4().makeRotationZ(jRad)
          .multiply(new Matrix4().makeRotationY(iRad)));

        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.position.copy(offset);
        mesh.position.addScaledVector(xAxis, this.props.radius);
        mesh.position.applyAxisAngle(zAxis, jRad);

        stoneId++;
      }
    }
  }

  private updateRayCastingMatrices() {
    this.inverseViewMatrix       = this.camera.matrixWorld;
    this.inverseProjectionMatrix = new Matrix4().getInverse(this.camera.projectionMatrix);
    this.inverseModelMatrixBoard = new Matrix4().getInverse(this.boardMesh.matrixWorld);
  }

  private updateUniforms() {

    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
    this.boardMesh.updateMatrixWorld(true);

    // Viewport, View and Projection matrix is the same for all objects
    const viewPort               = new Vector2(this.props.width, this.props.height);

    // now just for the board
    const transposedInverseModelMatrixBoard = this.inverseModelMatrixBoard.clone().transpose();

    this.boardMaterial.uniforms.viewPort.value                     = viewPort;
    this.boardMaterial.uniforms.inverseViewMatrix.value            = this.inverseViewMatrix;
    this.boardMaterial.uniforms.inverseProjectionMatrix.value      = this.inverseProjectionMatrix;
    this.boardMaterial.uniforms.inverseModelMatrix.value           = this.inverseModelMatrixBoard;
    this.boardMaterial.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrixBoard;
    this.boardMaterial.uniforms.boardSizeX.value                   = this.props.boardSizeX;
    this.boardMaterial.uniforms.boardSizeY.value                   = this.props.boardSizeY;
    this.boardMaterial.uniforms.radius.value                       = this.props.radius;
    this.boardMaterial.uniforms.thickness.value                    = this.props.thickness;
    this.boardMaterial.uniforms.twist.value                        = this.twist;
    this.boardMaterial.uniforms.torusColor.value                   = colorBoard;

    // now for all the stones
    for (let i = 0; i < this.props.boardSizeX*this.props.boardSizeY; i++ ) {
      const mesh     = this.stoneMeshArray[i];
      const material = this.stoneMaterialArray[i];
      const state    = this.props.boardState[i];

      mesh.updateMatrixWorld(true);

      const inverseModelMatrix           = new Matrix4().getInverse(mesh.matrixWorld);
      const transposedInverseModelMatrix = inverseModelMatrix.clone().transpose();

      material.uniforms.viewPort.value                     = viewPort;
      material.uniforms.inverseViewMatrix.value            = this.inverseViewMatrix;
      material.uniforms.inverseProjectionMatrix.value      = this.inverseProjectionMatrix;
      material.uniforms.inverseModelMatrix.value           = inverseModelMatrix;
      material.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrix;

      switch(state) {
        case 0: {
          mesh.visible = false;
          break;
        }
        case 1: {
          mesh.visible = true;
          material.uniforms.stoneColor.value = colorStoneBlack;
          break;
        }
        case 2: {
          mesh.visible = true;
          material.uniforms.stoneColor.value = colorStoneWhite;
          break;
        }
      }

      if (i === this.focusedField) {
        mesh.visible = true;
        material.uniforms.stoneColor.value = colorStoneHover;
      }
    }
  }

  private updateTwistKeyboard() {
    this.twist += this.props.keyboardControls.twistDelta;
    while (this.twist < 0) {this.twist += 2.0*Math.PI;}
    while (this.twist > 2.0*Math.PI) {this.twist -= 2.0*Math.PI;}
  }

  private updateCameraTrackballKeyboard() {
    const cameraAxisY = new Vector3().crossVectors(this.camera.up, this.camera.position).normalize();

    this.camera.position.addScaledVector( this.camera.up, this.props.keyboardControls.cameraDeltaX );
    this.camera.position.addScaledVector( cameraAxisY, this.props.keyboardControls.cameraDeltaY );
    this.camera.position.normalize();

    cameraAxisY.crossVectors(this.camera.up, this.camera.position);
    this.camera.up.crossVectors(this.camera.position, cameraAxisY);

    this.camera.position.multiplyScalar(this.props.radius * 4);
    this.camera.lookAt(new Vector3(0,0,0));
  }
}

export default ThreeAnimation;
