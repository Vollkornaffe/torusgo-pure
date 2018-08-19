import {DoubleSide, ShaderMaterial, Uniform, Vector3} from "three";

const vertexShader = `

void main()
{
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
  
`;

const fragmentShader = `

uniform mat4 inverseViewMatrix;
uniform float boardSizeX;
uniform float boardSizeY;
uniform float radius;
uniform float thickness;
uniform float twist;
uniform vec3  torusColor;

#define PI 3.1415926535897932384626433832795

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

// df(x)/dx
vec3 nTorus( in vec3 pos, vec2 tor )
{
   return normalize( pos*(dot(pos,pos)- tor.y*tor.y - tor.x*tor.x*vec3(1.0,1.0,-1.0)));
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
  vec4 imgplane_wc = inverseViewMatrix
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,-1.0,1.0);
  vec4 ray_wc = normalize(imgplane_wc - camera_wc);

  // raytrace-plane
  vec2 torus = vec2(radius, thickness);
  float t = iTorus( camera_wc.xyz, ray_wc.xyz, torus );

  if (t < 0.0 || t > 100.0) {discard;}

  // shading/lighting
  vec3 pos = camera_wc.xyz + t*ray_wc.xyz;

  vec3 nor = nTorus( pos, torus );
  float dif = clamp( dot(nor,-ray_wc.xyz), 0.0, 1.0 );
  float amb = clamp( 0.5 + 0.5*dot(nor,vec3(0.0,1.0,0.0)), 0.0, 1.0 );

  vec3 col = torusColor;

  col *= amb + dif * pow(t/2.0, -2.0);

  float theta_0 = atan2(pos.y, pos.x);
  mat3 rotMat = rotationMatrix(vec3(0.0,0.0,1.0), theta_0);
  vec3 pos_rotated =  rotMat * pos - vec3(torus.x,0.0,0.0);

  float mod_x_pos = mod(+twist+atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
  float mod_x_neg = mod(-twist-atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
  float mod_y_pos = mod(+twist+atan2(pos_rotated.x, pos_rotated.z), 2.0*PI/boardSizeY);
  float mod_y_neg = mod(-twist-atan2(pos_rotated.x, pos_rotated.z), 2.0*PI/boardSizeY);
  col *= pow(mod_x_pos * mod_x_neg * mod_y_pos * mod_y_neg, 0.2);

  col = sqrt( col );
  
  gl_FragColor = vec4( col, 1.0 );
}
  
`;

export default class TorusMaterialBoard extends ShaderMaterial {
  constructor(
    matrixWorld: THREE.Matrix4,
    boardSizeX:  number,
    boardSizeY:  number,
    radius:      number,
    thickness:   number,
    twist:       number,
    torusColor:  THREE.Color,
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
