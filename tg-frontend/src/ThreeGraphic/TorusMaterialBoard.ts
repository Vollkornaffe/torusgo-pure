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
uniform float boardSizeX;
uniform float boardSizeY;
uniform float radius;
uniform float thickness;
uniform float twist;
uniform vec3  torusColor;

#extension GL_EXT_frag_depth : enable
#define PI 3.1415926535897932384626433832795
#define EPS 0.000000001

float iTorus( in vec3 ro, in vec3 rd, in vec2 torus )
{
	float Ra2 = torus.x*torus.x;
	float ra2 = torus.y*torus.y;
	
	float m = dot(ro,ro);
	float n = dot(ro,rd);
		
	float k = (m - ra2 - Ra2)/2.0;
	float a = n;
	float b = n*n + Ra2*rd.z*rd.z + k;
	float c = k*n + Ra2*ro.z*rd.z;
	float d = k*k + Ra2*ro.z*ro.z - Ra2*ra2;
	
    //----------------------------------

	float p = -3.0*a*a     + 2.0*b;
	float q =  2.0*a*a*a   - 2.0*a*b   + 2.0*c;
	float r = -3.0*a*a*a*a + 4.0*a*a*b - 8.0*a*c + 4.0*d;
	p /= 3.0;
	r /= 3.0;
	float Q = p*p + r;
	float R = 3.0*r*p - p*p*p - q*q;
	
	float h = R*R - Q*Q*Q;
	float z = 0.0;
	if( h < 0.0 )
	{
		float sQ = sqrt(Q);
		z = 2.0*sQ*cos( acos(R/(sQ*Q)) / 3.0 );
	}
	else
	{
		float sQ = pow( sqrt(h) + abs(R), 1.0/3.0 );
		z = sign(R)*abs( sQ + Q/sQ );

	}
	
	z = p - z;
	
    //----------------------------------
	
	float d1 = z   - 3.0*p;
	float d2 = z*z - 3.0*r;

	if( abs(d1)<1.0e-4 )
	{
		if( d2<0.0 ) return -1.0;
		d2 = sqrt(d2);
	}
	else
	{
		if( d1<0.0 ) return -1.0;
		d1 = sqrt( d1/2.0 );
		d2 = q/d1;
	}

    //----------------------------------
	
	float result = 1e20;

	h = d1*d1 - z + d2;
	if( h>0.0 )
	{
		h = sqrt(h);
		float t1 = -d1 - h - a;
		float t2 = -d1 + h - a;
		     if( t1>0.0 ) result=t1;
		else if( t2>0.0 ) result=t2;
	}

	h = d1*d1 - z - d2;
	if( h>0.0 )
	{
		h = sqrt(h);
		float t1 = d1 - h - a;
		float t2 = d1 + h - a;
		     if( t1>0.0 ) result=min(result,t1);
		else if( t2>0.0 ) result=min(result,t2);
	}

  

	return result;
}

float sdTorus(in vec3 p, in vec2 t)
{
  vec2 q = vec2(length(p.xy)-t.x,p.z);
  return length(q)-t.y;
}

vec3 nTorus( in vec3 pos, in vec2 tor )
{
  return normalize( pos*(dot(pos,pos)- tor.y*tor.y - tor.x*tor.x*vec3(1.0,1.0,-1.0)));
}

float with_polish(in vec3 ro, in vec3 rd, in vec2 torus)
{
  float t = iTorus(ro, rd, torus);

  if (t < 0.0 || t > 100.0) {discard;}

  for (int i = 0; i < 10; i ++)
  {
    vec3 p = ro + rd*t;
    vec3 n = nTorus(p, torus);
    float d = sdTorus(p, torus);
    t -= dot(rd, n)*d;
  }

  return t;
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
  // set up ray in world coords
  vec4 camera_wc = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix * inverse(projectionMatrix) 
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,1.0,1.0);
  imgplane_wc /= imgplane_wc.w;

  vec4 ray_wc = normalize(imgplane_wc - camera_wc);

	// getting correct distance (and discarding non-intersects)
	vec2 torus = vec2(radius, thickness);
  float t = with_polish(camera_wc.xyz, ray_wc.xyz, torus);

	// lighting
	vec3 col = torusColor;
	vec3 pos = camera_wc.xyz + t*ray_wc.xyz;
	vec3 nor = nTorus( pos, torus );
	float dif = clamp( dot(-nor,ray_wc.xyz), 0.0, 1.0 );
	float amb = 0.5;
	col *= amb + dif;

	// lines
	float theta = atan2(pos.y, pos.x);
	mat3 rotMat = rotationMatrix(vec3(0.0,0.0,1.0), theta);
	vec3 pos_rot = rotMat * pos - vec3(torus.x,0.0,0.0);
	
	float mod_x_pos = mod(+twist+atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
	float mod_x_neg = mod(-twist-atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
	float mod_y_pos = mod(+twist+atan2(pos_rot.x, pos_rot.z), 2.0*PI/boardSizeY);
	float mod_y_neg = mod(-twist-atan2(pos_rot.x, pos_rot.z), 2.0*PI/boardSizeY);
	col *= pow(abs(mod_x_pos * mod_x_neg * mod_y_pos * mod_y_neg), 0.1);	

	gl_FragColor = vec4( col, 1.0 );

  gl_FragDepthEXT = t/10.0;
}

`;

export default class TorusMaterialBoard extends ShaderMaterial {
  constructor(
    matrixWorld: Matrix4,
    boardSizeX:  number,
    boardSizeY:  number,
    radius:      number,
    thickness:   number,
    twist:       number,
    torusColor:  Color,
    ) {
    const parameters =
    {
      side: DoubleSide,
      uniforms: {
        inverseViewMatrix: new Uniform(matrixWorld),
        boardSizeX:        new Uniform(boardSizeX ),
        boardSizeY:        new Uniform(boardSizeY ),
        radius:            new Uniform(radius     ),
        thickness:         new Uniform(thickness  ),
        twist:             new Uniform(twist      ),
        torusColor:        new Uniform(new Vector3(
          torusColor.r,
          torusColor.g,
          torusColor.b)),
      },
      vertexShader: vertexShader.concat(),
      fragmentShader: fragmentShader.concat(),
    };
    super(parameters);
  }
}
