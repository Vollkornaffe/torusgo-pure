import {
  Color,
  DoubleSide,
  Matrix4,
  ShaderMaterial,
  Uniform,
  Vector3
} from "three";

const vertexShader = `

void main()
{
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
  
`;

const fragmentShader = `
uniform mat4 projectionMatrix;
uniform mat4 inverseViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 inverseModelMatrix;
uniform float ellipseX;
uniform float ellipseY;
uniform float ellipseZ;
uniform vec3 stoneColor;

#extension GL_EXT_frag_depth : enable
#define PI 3.1415926535897932384626433832795
#define EPS 0.000000001

float iSphere(in vec3 ro, in vec3 rd) {
  float b = 2.0 * dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float under_root = b*b - 4.0 * c;
  if (under_root < 0.0) {return -1.0;}
  return (-b-sqrt(under_root))/2.0;
}

mat4 transpose(mat4 m) {
  return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
              m[0][1], m[1][1], m[2][1], m[3][1],
              m[0][2], m[1][2], m[2][2], m[3][2],
              m[0][3], m[1][3], m[2][3], m[3][3]);
}

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

void main() {
  // set up in world coords
  vec4 camera_wc = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix * inverse(projectionMatrix) 
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,1.0,1.0);
  imgplane_wc /= imgplane_wc.w;
  vec4 ray_wc = normalize(imgplane_wc - camera_wc);
    
  // set up in object coords
  // SHOULD BE INVERTED ONCE, ON CPU SIDE
  // vec4 camera_oc   = inverseModelMatrix * camera_wc;
  // vec4 imgplane_oc = inverseModelMatrix * imgplane_wc;
  mat4 real_inverseModelMatrix = inverse(modelMatrix);
  
  vec4 camera_oc   = real_inverseModelMatrix * camera_wc;
  vec4 imgplane_oc = real_inverseModelMatrix * imgplane_wc;
  vec4 ray_oc = normalize(imgplane_oc - camera_oc);

	// getting correct distance (and discard non-intersects)
  float t_oc = iSphere(camera_oc.xyz, ray_oc.xyz);
  
  if (t_oc < 0.0) {discard;}
  float t_wc = t_oc*length(modelMatrix*ray_oc);
  
	// lighting
	vec3 col = stoneColor;
	vec4 nor_oc = normalize(vec4(camera_oc.xyz + t_oc*ray_oc.xyz, 0.0));
	vec4 nor_wc = normalize(transpose(real_inverseModelMatrix) * nor_oc);
	float dif = clamp( dot(-ray_wc, nor_wc), 0.0, 1.0 );
	float amb = 0.1;
	col *= amb + dif;

	gl_FragColor = vec4( col, 1.0 );

  gl_FragDepthEXT = t_wc/10.0;
}

`;

export default class TorusMaterialStone extends ShaderMaterial {
  constructor(
    matrixWorldCamera: Matrix4,
    matrixWorldStone:  Matrix4,
    stoneColor:         Color,
    ) {
    const parameters =
    {
      side: DoubleSide,
      uniforms: {
        inverseViewMatrix:  new Uniform(matrixWorldCamera),
        inverseModelMatrix: new Uniform(matrixWorldStone),
        stoneColor:         new Uniform(new Vector3(
          stoneColor.r,
          stoneColor.g,
          stoneColor.b)),
      },
      vertexShader: vertexShader.concat(),
      fragmentShader: fragmentShader.concat(),
    };
    super(parameters);
  }
}
