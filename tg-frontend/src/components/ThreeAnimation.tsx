import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import * as React from 'react';
import autoBind from 'react-autobind';
import * as Stats from 'stats.js';
import {BoxGeometry, Color, Matrix4, Mesh, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer,} from 'three';

import RayCast from '../ThreeGraphic/RayCast';
import RayCastTorus from '../ThreeGraphic/RayCastTorus';
import TorusMaterialBoard from '../ThreeGraphic/TorusMaterialBoard';
import TorusMaterialStone from '../ThreeGraphic/TorusMaterialStone';

import theme from "../theme";

import {execMove, testLegal} from "../utils/GameLogicWrapper";

export interface IKeyboardControls {
  cameraDeltaX: number,
  cameraDeltaY: number,
  twistDelta: number,
  mouseControl: boolean,
}

export interface IProps {
  // current control via keyboard
  keyboardControls: IKeyboardControls,

  // number of fields
  boardSizeX: number,
  boardSizeY: number,

  // torus and stone dimensions
  radius: number,
  thickness: number,
  stoneSize: number,

  // key states
  // ?

  // 0: empty, 1: white, 2: black, 3: aiming mouse here ?
  boardState: number[],
}

const styles          = () => {
  return createStyles({
    root: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
  });
};
// colors are const
const colorClear      = new Color(0x4286f4);
const colorBoard      = new Color(0xFF6B00);
const colorStoneWhite = new Color(0xe6ffff);
const colorStoneBlack = new Color(0x1a0008);
const colorStoneHover = new Color(0xFFD700);

// rainbow!
const violet = new Color(0x9400D4);
const indigo = new Color(0x4B0082);
const blue   = new Color(0x0000FF);
const green  = new Color(0x00FF00);
const yellow = new Color(0xFFFF00);
const orange = new Color(0xFF7F00);
const red    = new Color(0xFF0000);

const box222 = new BoxGeometry(2, 2, 2);

class ThreeAnimation extends React.Component<IProps & WithStyles<typeof styles>> {
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
  private focusedFieldX: number;
  private focusedFieldY: number;

  private stats: Stats;

  // for party
  private partyMode = false;

  // nothing much happening in constructor
  // first canvas needs to be created
  public constructor(props: IProps & WithStyles<typeof styles>) {
    super(props);
    autoBind(this);
  }

  public componentDidMount() {
    this.scene = new Scene();

    this.initRenderer();
    this.initCamera();

    this.updateViewport();

    this.initTwist();
    this.initMouse();
    this.setupStoneArrays();
    this.updateBoardTransform();

    this.initStats();

    this.animate();

    // for raycasting:
    this.canvas.addEventListener('mousemove', this.updateMousePos);
    this.canvas.addEventListener('mousedown', this.dispatchHover);
    window.addEventListener('resize', this.updateViewport);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.boardSizeX !== prevProps.boardSizeX
      || this.props.boardSizeY !== prevProps.boardSizeY) {
      this.cleanUpStones();
      this.setupStoneArrays();
    }

    if (this.props.radius !== prevProps.radius
      || this.props.thickness !== prevProps.thickness) {
      this.cleanUpBoard();
      this.updateBoardTransform();
    }
  }

  public componentWillUnmount() {
    this.cleanUp();
    this.canvas.removeEventListener('mousemove', this.updateMousePos);
    this.canvas.removeEventListener('mousedown', this.dispatchHover);
    window.removeEventListener('resize', this.updateViewport);
  }

  public render() {
    const {classes} = this.props;
    return <canvas className={classes.root} tabIndex={1}
                   ref={(canvas) => this.canvas = canvas!} />;
  }

  // Raycasting on CPU side, for detecting focused field
  private updateMousePos(event: MouseEvent) {
    const offsetX = event.clientX - theme.layout.appBarHeight;
    const offsetY = event.clientY - theme.layout.sideBarWidth;

    if (offsetX > 0
      && offsetX < this.canvas.width
      && offsetY > 0
      && offsetY < this.canvas.height) {
      this.mousePos.x = 2.0 * (offsetX) / this.canvas.width - 1.0;
      this.mousePos.y = -2.0 * (offsetY) / this.canvas.height + 1.0;
      this.inCanvas   = true;
    } else {
      this.inCanvas = false;
    }
  }

  private dispatchHover() {

    if (!this.inCanvas || this.focusedField === -1) {
      return;
    }

    const move = {
        x: this.focusedFieldX,
        y: this.focusedFieldY
    };
    const moveLegal = testLegal(move);
    if (moveLegal) {
      execMove(move);
    }
  }

  private updateHover() {
    const [cameraPosOC, rayDirectionOC] = RayCast(
      this.mousePos,
      this.camera.position,
      this.inverseProjectionMatrix,
      this.inverseViewMatrix,
      this.inverseModelMatrixBoard);
    const distance                      = RayCastTorus(
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
    if (theta < 0) {
      theta += 2.0 * Math.PI;
    }

    // we have to roatate back
    const rotationMat = new Matrix4().makeRotationZ(-theta);
    hitPosOC.applyMatrix4(rotationMat);
    hitPosOC.x -= this.props.radius;

    // noinspection JSSuspiciousNameCombination
    let phi = Math.atan2(hitPosOC.x, hitPosOC.z);
    if (phi < 0) {
      phi += 2.0 * Math.PI;
    }

    // sub twist and renormalize
    phi -= this.twist;
    while (phi < 0) {
      phi += 2.0 * Math.PI;
    }
    while (phi > 2.0 * Math.PI) {
      phi -= 2.0 * Math.PI;
    }

    // calculate the indices on a 2d-array
    let i = Math.round(phi / (2.0 * Math.PI / this.props.boardSizeX));
    let j = Math.round(theta / (2.0 * Math.PI / this.props.boardSizeY));

    if (i === this.props.boardSizeX) {
      i = 0;
    }
    if (j === this.props.boardSizeY) {
      j = 0;
    }

    this.focusedField = j + i * this.props.boardSizeY;
    this.focusedFieldX = i;
    this.focusedFieldY = j;
  }

  // Here all the animation related functions follow

  private animate() {
    this.requestId = requestAnimationFrame(this.animate.bind(this));

    this.stats.begin();

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

    this.stats.end();
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
      45, 1, 0.1, 100,
    );
    this.camera.up.set(0, 1, 0);
    this.camera.position.set(0, 0, this.props.radius * 4.0);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  private initStats() {
    this.stats                   = new Stats();
    this.stats.dom.style.cssText = 'position:absolute;right:0;cursor:pointer;opacity:0.9;z-index:10000;';
    this.canvas.parentElement!.insertBefore(this.stats.dom, this.canvas);

    this.stats.showPanel(0);
  }

  private cleanUp() {
    this.renderer.dispose();
    this.cleanUpStones();
    box222.dispose(); // this one kinda special
    this.cleanUpBoard();

    this.cleanUpStats();

    cancelAnimationFrame(this.requestId);
  }

  private cleanUpBoard() {
    this.scene.remove(this.boardMesh);
    this.boardGeometry.dispose();
    this.boardMaterial.dispose();
  }

  private cleanUpStats() {
    this.stats.dom.remove();
  }

  private cleanUpStones() {
    for (const mesh of this.stoneMeshArray) {
      this.scene.remove(mesh);
    }
    for (const material of this.stoneMaterialArray) {
      material.dispose();
    }
    this.stoneMeshArray     = [];
    this.stoneMaterialArray = [];
  }

  private updateViewport() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    this.canvas.width  = w;
    this.canvas.height = h;

    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

  }

  private setupStoneArrays() {
    this.stoneMaterialArray = [];
    this.stoneMeshArray     = [];
    for (let i = 0; i < this.props.boardSizeX; i++) {
      for (let j = 0; j < this.props.boardSizeY; j++) {
        const material = new TorusMaterialStone();
        const mesh     = new Mesh(box222, material);
        this.stoneMaterialArray.push(material);
        this.stoneMeshArray.push(mesh);
        this.scene.add(mesh);
      }
    }
  }

  private updateBoardTransform() {
    this.boardGeometry = new BoxGeometry(
      2.0 * (this.props.radius + this.props.thickness),
      2.0 * (this.props.radius + this.props.thickness),
      2.0 * this.props.thickness,
    );
    this.boardMaterial = new TorusMaterialBoard();
    this.boardMesh     = new Mesh(this.boardGeometry, this.boardMaterial);
    this.scene.add(this.boardMesh);
  }


  private updateStoneTransforms() {
    const scaleX = (this.props.thickness + this.props.stoneSize)
      * Math.PI / this.props.boardSizeX * 0.9; // the 0.9 enables a small gap
    let scaleY; // to be determined for each iRad
    const scaleZ = this.props.stoneSize;

    let stoneId = 0;
    const xAxis = new Vector3(1, 0, 0);
    const zAxis = new Vector3(0, 0, 1);
    for (let i = 0; i < this.props.boardSizeX; i++) {
      const iRad   = i / this.props.boardSizeX * 2 * Math.PI + this.twist;
      const offset = new Vector3(
        (this.props.thickness + scaleZ) * Math.sin(iRad),
        0,
        (this.props.thickness + scaleZ) * Math.cos(iRad),
      );

      const innerRingRadius = this.props.radius
        + (this.props.thickness + scaleZ) * Math.cos(iRad - Math.PI / 2.0);
      scaleY                = innerRingRadius * Math.PI / this.props.boardSizeY * 0.9; // the 0.9 enables a small gap

      for (let j = 0; j < this.props.boardSizeY; j++) {
        const jRad = j / this.props.boardSizeY * 2 * Math.PI;


        const mesh = this.stoneMeshArray[stoneId];

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
    const viewPort = new Vector2(this.canvas.width, this.canvas.height);

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
    for (let i = 0; i < this.props.boardSizeX * this.props.boardSizeY; i++) {
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

      if (this.partyMode) {
        switch (state) {
          case 0: {
            mesh.visible = false;
            break;
          }
          case 1: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = violet;
            break;
          }
          case 2: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = indigo;
            break;
          }
          case 3: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = blue;
            break;
          }
          case 4: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = green;
            break;
          }
          case 5: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = yellow;
            break;
          }
          case 6: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = orange;
            break;
          }
          case 7: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = red;
            break;
          }
        }

      } else {
        switch (state) {
          case 0: {
            mesh.visible = false;
            break;
          }
          case 1: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = colorStoneBlack;
            break;
          }
          case 2: {
            mesh.visible                       = true;
            material.uniforms.stoneColor.value = colorStoneWhite;
            break;
          }
        }
      }

      if (i === this.focusedField) {
        mesh.visible                       = true;
        material.uniforms.stoneColor.value = colorStoneHover;
      }
    }
  }

  private updateTwistKeyboard() {
    this.twist += this.props.keyboardControls.twistDelta;
    while (this.twist < 0) {
      this.twist += 2.0 * Math.PI;
    }
    while (this.twist > 2.0 * Math.PI) {
      this.twist -= 2.0 * Math.PI;
    }
  }

  private updateCameraTrackballKeyboard() {
    const cameraAxisY = new Vector3().crossVectors(this.camera.up, this.camera.position).normalize();

    this.camera.position.addScaledVector(this.camera.up, this.props.keyboardControls.cameraDeltaX);
    this.camera.position.addScaledVector(cameraAxisY, this.props.keyboardControls.cameraDeltaY);
    this.camera.position.normalize();

    cameraAxisY.crossVectors(this.camera.up, this.camera.position);
    this.camera.up.crossVectors(this.camera.position, cameraAxisY);

    this.camera.position.multiplyScalar(this.props.radius * 4);
    this.camera.lookAt(new Vector3(0, 0, 0));
  }
}

export default withStyles(styles)(ThreeAnimation);
