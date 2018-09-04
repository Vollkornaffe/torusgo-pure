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
uniform mat4 inverseViewMatrix;
uniform mat4 inverseModelMatrix;
uniform float ellipseX;
uniform float ellipseY;
uniform float ellipseZ;
uniform vec3 stoneColor;

#extension GL_EXT_frag_depth : enable
#define PI 3.1415926535897932384626433832795
#define EPS 0.000000001

float iEllipse(in vec3 ro, in vec3 rd, in vec3 ell) {
  float a = rd.x*rd.x / (ell.x*ell.x) + rd.y*rd.y / (ell.y*ell.y) + rd.z*rd.z / (ell.z*ell.z);
  float b = 2.0 * (ro.x*rd.x / (ell.x*ell.x) + ro.y*rd.y / (ell.y*ell.y) + ro.z*rd.z / (ell.z*ell.z));
  float c = ro.x*ro.x / (ell.x*ell.x) + ro.y*ro.y / (ell.y*ell.y) + ro.z*ro.z / (ell.z*ell.z) - 1.0;
  
  float under_root = b*b - 4.0 * a * c;
  if (under_root < 0.0) { return -1.0;}
  return (- b - sqrt(under_root))/(2.0 * a);
}

vec3 nEllipse(in vec3 pos, in vec3 ell) {
    return normalize(vec3(
        2.0*pos.x/(ell.x*ell.x),
        2.0*pos.y/(ell.y*ell.y),
        2.0*pos.z/(ell.z*ell.z)
    ));
}

mat3 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c         );
}

float atan2(in float y, in float x)
{
 return x == 0.0 ? sign(y)*PI/2.0 : atan(y, x);
}

void main() {
  // set up in world coords
  vec4 camera_wc = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,-1.0,1.0);
    
  // set up in object coords
  vec4 camera_oc = inverseModelMatrix * camera_wc;
  vec4 imgplane_oc = inverseModelMatrix * imgplane_wc;
  vec4 ray_oc = normalize(imgplane_oc - camera_oc);

	// getting correct distance (and discarding non-intersects)
	vec3 ellipse = vec3( ellipseX, ellipseY, ellipseZ);
	
  float t = iEllipse(camera_oc.xyz, ray_oc.xyz, ellipse);
  
  if (t < 0.0) {discard;}

	// lighting
	vec3 col = stoneColor;
	vec3 pos = camera_oc.xyz + t*ray_oc.xyz;
	vec3 nor = nEllipse( pos, ellipse );
	float dif = clamp( dot(-nor,ray_oc.xyz), 0.0, 1.0 );
	float amb = 0.1;
	col *= amb + dif;

	gl_FragColor = vec4( col, 1.0 );

  gl_FragDepthEXT = t/10.0;
}

`;

export default class TorusMaterialStone extends ShaderMaterial {
  constructor(
    matrixWorldCamera: Matrix4,
    matrixWorldStone:  Matrix4,
    ellipseX:           number,
    ellipseY:           number,
    ellipseZ:           number,
    stoneColor:         Color,
    ) {
    const parameters =
    {
      side: DoubleSide,
      uniforms: {
        inverseViewMatrix:  new Uniform(matrixWorldCamera),
        inverseModelMatrix: new Uniform(matrixWorldStone),
        ellipseX:           new Uniform(ellipseX),
        ellipseY:           new Uniform(ellipseY),
        ellipseZ:           new Uniform(ellipseZ),
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
