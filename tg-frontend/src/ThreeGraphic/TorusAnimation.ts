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
  ShaderMaterial,
  TorusBufferGeometry,
  Uniform,
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

	private angle: number;
  private experimentalShader: THREE.ShaderMaterial;

  private testGeometry: THREE.BoxGeometry;
  private torusGeometryGeneral: TorusGeometryGeneral;
  private torusGeometryFaces: TorusGeometryFaces;
  private torusGeometryLines: TorusGeometryLines;
  // private torusGeometryRaycast: TorusGeometryRaycast;

  private testMesh: THREE.Mesh;
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
    this.camera.position.set(0, 0, 5);
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

		this.angle = 0.0;
    this.experimentalShader = new ShaderMaterial({
			uniforms: {
        inverseViewMatrix: new Uniform(this.camera.matrixWorld),
			},
    	vertexShader: [
        "void main() {",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}",
      ].join( "\n" ),

      fragmentShader: [
        "uniform mat4 inverseViewMatrix;",

"float iTorus( in vec3 ro, in vec3 rd, in vec2 torus )",
"{",
	"float Ra2 = torus.x*torus.x;",
	"float ra2 = torus.y*torus.y;",
	"",
	"float m = dot(ro,ro);",
	"float n = dot(ro,rd);",
		"",
	"float k = (m - ra2 - Ra2)/2.0;",
	"float a = n;",
	"float b = n*n + Ra2*rd.z*rd.z + k;",
	"float c = k*n + Ra2*ro.z*rd.z;",
	"float d = k*k + Ra2*ro.z*ro.z - Ra2*ra2;",
	"",
    "//----------------------------------",
"",
	"float p = -3.0*a*a     + 2.0*b;",
	"float q =  2.0*a*a*a   - 2.0*a*b   + 2.0*c;",
	"float r = -3.0*a*a*a*a + 4.0*a*a*b - 8.0*a*c + 4.0*d;",
	"p /= 3.0;",
	"r /= 3.0;",
	"float Q = p*p + r;",
	"float R = 3.0*r*p - p*p*p - q*q;",
	"",
	"float h = R*R - Q*Q*Q;",
	"float z = 0.0;",
	"if( h < 0.0 )",
	"{",
		"float sQ = sqrt(Q);",
		"z = 2.0*sQ*cos( acos(R/(sQ*Q)) / 3.0 );",
	"}",
	"else",
	"{",
		"float sQ = pow( sqrt(h) + abs(R), 1.0/3.0 );",
		"z = sign(R)*abs( sQ + Q/sQ );",
"",
	"}",
	"",
	"z = p - z;",
	"",
    "//----------------------------------",
	"",
	"float d1 = z   - 3.0*p;",
	"float d2 = z*z - 3.0*r;",
"",
	"if( abs(d1)<1.0e-4 )",
	"{",
		"if( d2<0.0 ) return -1.0;",
		"d2 = sqrt(d2);",
	"}",
	"else",
	"{",
		"if( d1<0.0 ) return -1.0;",
		"d1 = sqrt( d1/2.0 );",
		"d2 = q/d1;",
	"}",
"",
    "//----------------------------------",
	"",
	"float result = 1e20;",
"",
	"h = d1*d1 - z + d2;",
	"if( h>0.0 )",
	"{",
		"h = sqrt(h);",
		"float t1 = -d1 - h - a;",
		"float t2 = -d1 + h - a;",
		     "if( t1>0.0 ) result=t1;",
		"else if( t2>0.0 ) result=t2;",
	"}",
"",
	"h = d1*d1 - z - d2;",
	"if( h>0.0 )",
	"{",
		"h = sqrt(h);",
		"float t1 = d1 - h - a;",
		"float t2 = d1 + h - a;",
		     "if( t1>0.0 ) result=min(result,t1);",
		"else if( t2>0.0 ) result=min(result,t2);",
	"}",
"",
	"return result;",
"}",
"",

"// df(x)/dx",
"vec3 nTorus( in vec3 pos, vec2 tor )",
"{",
	"return normalize( pos*(dot(pos,pos)- tor.y*tor.y - tor.x*tor.x*vec3(1.0,1.0,-1.0)));",
"}",


        "void main() {",
          "vec4 camera_wc = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);",
          "vec4 imgplane_wc = inverseViewMatrix * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,-1.0,1.0);",
          "vec4 ray_wc = normalize(imgplane_wc - camera_wc);",

	"// raytrace-plane",
	"vec2 torus = vec2(2.0,0.9);",
	"float t = iTorus( camera_wc.xyz, ray_wc.xyz, torus );",



					"if (t < 0.0) {discard;}",
  "// shading/lighting	",
	"vec3 col = vec3(0.0);",
	"if( t>0.0 && t<100.0 )",
	"{",
	    "vec3 pos = camera_wc.xyz + t*ray_wc.xyz;",
		"vec3 nor = nTorus( pos, torus );",
		"float dif = clamp( dot(nor,vec3(0.57703)), 0.0, 1.0 );",
		"float amb = clamp( 0.5 + 0.5*dot(nor,vec3(0.0,1.0,0.0)), 0.0, 1.0 );",
		"col = vec3(0.2,0.3,0.4)*amb + vec3(1.0,0.9,0.7)*dif;",
		"col *= 0.8;",
	"}",
	"",
	"col = sqrt( col );",

          // "if (dot(ray_wc, camera_wc) * dot(ray_wc, camera_wc) - dot(camera_wc, camera_wc) + 2.0 < 0.0) {discard;}",

					"gl_FragColor = vec4( col, 1.0 );",
				"}",
      ].join( "\n" )
    });

    this.testGeometry = new BoxGeometry(2,2,2);
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

    this.testMesh = new Mesh(this.testGeometry, this.experimentalShader);
    this.torusMeshFaces = new Mesh(this.torusGeometryFaces, this.torusMaterialFaces);
    this.torusMeshLines = new LineSegments(this.torusGeometryLines, this.torusMaterialLines);
    // this.torusMeshRaycast = new Mesh(this.torusGeometryFancy, this.torusMaterialFancy);

    // this.torusMeshFancy.rotation.y = Math.PI / 2;
    // this.torusMeshFancy.geometry.computeVertexNormals();

    this.scene.add(this.testMesh);
    // this.scene.add(this.torusMeshFaces);
    // this.scene.add(this.torusMeshLines);
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

		// Use Math.cos and Math.sin to set camera X and Z values based on angle. 
		this.camera.position.x = 5.0 * Math.cos( this.angle );  
		this.camera.position.z = 5.0 * Math.sin( this.angle );
		console.log(this.camera.position);
		this.camera.lookAt(0.0,0.0,0.0);
		this.angle += 0.01;

    this.torusGeometryGeneral.update();
    this.torusGeometryFaces.update();
    this.torusGeometryLines.update();

    this.renderer.render(this.scene, this.camera);
  }
}     
      
export default TorusAnimation;
