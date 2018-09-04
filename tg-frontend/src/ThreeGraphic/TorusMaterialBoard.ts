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
uniform float boardSizeX;
uniform float boardSizeY;
uniform float radius;
uniform float thickness;
uniform float twist;
uniform vec3  torusColor;

#extension GL_EXT_frag_depth : enable
#define PI 3.1415926535897932384626433832795
#define EPS 0.00000000000001

bool verySmall(in float x)
{
    return abs(x) < EPS;
}

float cbrt(in float x) {
  if (x > 0.0) {
    return pow(x, 1.0/3.0);
  } else {
    return -pow(-x, 1.0/3.0);
  }
}

int solve_2(in float c_0, in float c_1, in float c_2, inout float s_0, inout float s_1) {
  /* normal form: x^2 + px + q = 0 */

  float p = c_1 / (2.0 * c_2);
  float q = c_0 / c_2;

  float D = p * p - q;

  if (verySmall(D))
  {
    s_0 = - p;
    return 1;
  }
  else if (D < 0.0)
  {
    return 0;
  }
  else /* if (D > 0) */
  {
    float sqrt_D = sqrt(D);
    s_0 =   sqrt_D - p;
    s_1 = - sqrt_D - p;
    return 2;
  }
}

int solve_3(in float c_0, in float c_1, in float c_2, in float c_3, inout float s_0, inout float s_1, inout float s_2) {
  int i, num;
  float sub;
  float A, B, C;
  float sq_A, p, q;
  float cb_p, D;

  /* normal form: x^3 + Ax^2 + Bx + C = 0 */

  A = c_2 / c_3;
  B = c_1 / c_3;
  C = c_0 / c_3;

  /*  substitute x = y - A/3 to eliminate quadric term: x^3 +px + q = 0 */

  sq_A = A * A;
  p = 1.0/3.0 * (- 1.0/3.0 * sq_A + B);
  q = 1.0/2.0 * (2.0/27.0 * A * sq_A - 1.0/3.0 * A * B + C);

  /* use Cardano's formula */

  cb_p = p * p * p;
  D = q * q + cb_p;

  if (verySmall(D))
  {
    if (verySmall(q)) /* one triple solution */
    {
      s_0 = 0.0;
      num = 1;
    }
    else /* one single and one double solution */
    {
      float u = cbrt(q);
      s_0 = 2.0 * u;
      s_1 = - u;
      num = 2;
    }
  }
  else if (D < 0.0) /* Casus irreducibilis: three real solutions */
  {
    float phi = 1.0/3.0 * acos(-q / sqrt(-cb_p));
    float t = 2.0 * sqrt(-p);

    s_0 =   t * cos(phi);
    s_1 = - t * cos(phi + PI / 3.0);
    s_2 = - t * cos(phi - PI / 3.0);
    num = 3;
  }
  else /* one real solution */
  {
    float sqrt_D = sqrt(D);
    float u = cbrt(sqrt_D - q);
    float v = - cbrt(sqrt_D + q);

    s_0 = u + v;
    num = 1;
  }

  /* resubstitute */

  sub = 1.0/3.0 * A;

  s_0 -= sub;
  s_1 -= sub;
  s_2 -= sub;

  return num;
}


int solve_4( in float c_0, in float c_1, in float c_2, in float c_3, in float c_4, inout float s_0, inout float s_1, inout float s_2, inout float s_3) {
  float  coeffs_0;
  float  coeffs_1;
  float  coeffs_2;
  float  coeffs_3;
  float  z, u, v, sub;
  float  A, B, C, D;
  float  sq_A, p, q, r;
  int     i, num = 0;
 
  s_0 = 0.0; s_1 = 0.0; s_2 = 0.0; s_3 = 0.0; 
  
  /* normal form: x^4 + Ax^3 + Bx^2 + Cx + D = 0 */

  A = c_3 / c_4;
  B = c_2 / c_4;
  C = c_1 / c_4;
  D = c_0 / c_4;
  
  /*  substiute x = y - A/4 to eliminate cubic term: x^4 + px^2 + qx + r = 0 */

  sq_A = A *A;
  p = - 3.0/8.0 * sq_A + B;
  q =1.0/8.0 * sq_A * A - 1.0/2.0 * A * B + C;
  r =- 3.0/256.0*sq_A*sq_A + 1.0/16.0*sq_A*B - 1.0/4.0*A*C + D;

  if (verySmall(r))
  {
    /* no absolute term: y(y^3 + py + q) = 0 */

    coeffs_0 = q;
    coeffs_1 = p;
    coeffs_2 = 0.0;
    coeffs_3 = 1.0;
   
    num = solve_3( coeffs_0, coeffs_1, coeffs_2, coeffs_3, s_0, s_1, s_2) + 1;
  }
  else
  {
    /* sole the resolvent cubic ... */

    coeffs_0 = 1.0/2.0 * r * p - 1.0/8.0 * q * q;
    coeffs_1 = - r;
    coeffs_2 = - 1.0/2.0 * p;
    coeffs_3 = 1.0;

    solve_3( coeffs_0, coeffs_1, coeffs_2, coeffs_3, s_0, s_1, s_2);

    /* ... and take the one real solution ... */

    z = s_0;

    /* ... to build two quadric equations */

    u = z * z - r;
    v = 2.0 * z - p;

    if (verySmall(u)) {
      u = 0.0;
    } else if (u > 0.0) {
      u = sqrt(u);
    } else {
      return 0;
    }

    if (verySmall(v)) {
        v = 0.0;
    } else if (v > 0.0) {
        v = sqrt(v);
    } else {
      return 0;
    }

    coeffs_0 = z - u;
    coeffs_1 = q < 0.0 ? -v : v;
    coeffs_2 = 1.0;
    num = solve_2( coeffs_0, coeffs_1, coeffs_2, s_0, s_1);

    coeffs_0 = z + u;
    coeffs_1 = q < 0.0 ? v : -v;
    coeffs_2 = 1.0;
    num += solve_2( coeffs_0, coeffs_1, coeffs_2, s_0, s_1);
  }

  /* resubstitute */

  sub = 1.0/4.0 * A;

  s_0 -= sub;
  s_1 -= sub;
  s_2 -= sub;
  s_3 -= sub;

  return num;
}

int test(in vec3 ro, in vec3 rd, in vec2 torus)
{
    float a = ro.x;
    float b = ro.y;
    float c = ro.z;
    float x = rd.x;
    float y = rd.y;
    float z = rd.z;
    float w = torus.y;

    float c_4 = 1.0;
    float c_3 = 0.0;
    float c_2 = -2.0 +2.0*a*a +2.0*b*b +2.0*c*c -2.0*w +4.0*z*z;
    float c_1 = 8.0*c*z;
    float c_0 = 1.0 -2.0*a*a +a*a*a*a -2.0*b*b +2.0*a*a*b*b +b*b*b*b +2.0*c*c +2.0*a*a*c*c +2.0*b*b*c*c +c*c*c*c -2.0*w -2.0*a*a*w -2.0*b*b*w -2.0*c*c*w +w*w;

    float s_0 = 0.0;
    float s_1 = 0.0;
    float s_2 = 0.0;
    float s_3 = 0.0;

    if ( solve_4 ( c_0, c_1, c_2, c_3, c_4, s_0, s_1, s_2, s_3 ) == 0) {discard;}

    return 0;
}

void main() {
  // set up ray in world coords
  vec4 camera_wc = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix
    * vec4((2.0*gl_FragCoord.x - 1000.0)*0.001,(2.0*gl_FragCoord.y - 1000.0)*0.001,-1.0,1.0);
  vec4 ray_wc = normalize(imgplane_wc - camera_wc);

  vec4 newStart = camera_wc - dot(camera_wc, ray_wc) * ray_wc;

  // raytrace-plane
  vec2 torus = vec2(radius, thickness);

  float t;

  test(newStart.xyz, ray_wc.xyz, torus);

  gl_FragColor = vec4( newStart.xyz,1.0 );
  // gl_FragDepthEXT = t;
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
    torusColor: Color,
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
