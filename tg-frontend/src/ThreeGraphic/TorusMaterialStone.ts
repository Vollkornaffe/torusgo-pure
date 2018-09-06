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
// these are supplied by three js
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

// these are custom
uniform mat4 inverseViewMatrix;
uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseModelMatrix;
uniform mat4 transposedInverseModelMatrix;
uniform vec3 stoneColor;

#extension GL_EXT_frag_depth : enable

float iSphere(in vec3 ro, in vec3 rd) {
  float b = 2.0 * dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float under_root = b*b - 4.0 * c;
  if (under_root < 0.0) {discard;}
  return (-b-sqrt(under_root))/2.0;
}

void main() {
  // set up in world coords
  vec4 camera_wc   = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix * inverseProjectionMatrix
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,1.0,1.0);
  imgplane_wc /= imgplane_wc.w;
  vec4 ray_wc = normalize(imgplane_wc - camera_wc);
    
  // set up in object coords
  vec4 camera_oc   = inverseModelMatrix * camera_wc;
  vec4 imgplane_oc = inverseModelMatrix * imgplane_wc;
  vec4 ray_oc = normalize(imgplane_oc - camera_oc);

	// getting correct distance (and discard non-intersects)
  float t_oc = iSphere(camera_oc.xyz, ray_oc.xyz);
  float t_wc = t_oc*length(modelMatrix*ray_oc);
  
	// lighting
	vec3 col = stoneColor;
	vec4 nor_oc = normalize(vec4(camera_oc.xyz + t_oc*ray_oc.xyz, 0.0));
	vec4 nor_wc = normalize(transposedInverseModelMatrix * nor_oc);
	float dif = clamp( dot(-ray_wc, nor_wc), 0.0, 1.0 );
	float amb = 0.1;
	col *= amb + dif;
	
	// specular highlights
	col += vec3(1.0,1.0,1.0) * pow(dot(-ray_wc, nor_wc),5.0);

	//gl_FragColor = vec4( col, 1.0 );
	gl_FragColor = vec4(nor_wc.xyz, 1.0);

  gl_FragDepthEXT = t_wc/10.0;
}

`;

export default class TorusMaterialStone extends ShaderMaterial {
  constructor(
    // all of these must be updated anyway...
    // no point in passing them in constructor
    // inverseViewMatrix:             Matrix4,
    // inverseProjectionMatrix:       Matrix4,
    // inverseModelMatrix:            Matrix4,
    // transposedInverseModelMatrix:  Matrix4,
    stoneColor:         Color,
  ) {
    const parameters =
    {
      side: DoubleSide,
      uniforms: {
        inverseViewMatrix:            new Uniform(new Matrix4()),
        inverseProjectionMatrix:      new Uniform(new Matrix4()),
        inverseModelMatrix:           new Uniform(new Matrix4()),
        transposedInverseModelMatrix: new Uniform(new Matrix4()),
        stoneColor:                   new Uniform(new Vector3(
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
