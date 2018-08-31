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

float atan2(in float y, in float x)
{
    float tmp = (x == 0.0 ? sign(y)*PI/2.0 : atan(y, x));
    if (tmp < 0.0) {
        return 2.0*PI + tmp;
    }
    return tmp;
}

// complex multiplication c_1 * c_2
vec2 compl_mul(in vec2 c_1, in vec2 c_2) {
    return vec2(c_1.x*c_2.x - c_1.y*c_2.y,
                c_1.x*c_2.y + c_1.y*c_2.x);
}

// real power of complex number c^p
vec2 compl_pow(in vec2 c, in float p)
{
    float abs_c = length(c);
    float phi = atan2(c.y, c.x);
    
    return pow(abs_c, p) * vec2(cos(phi * p), sin(phi * p));
}

vec2 compl_nth_root(in vec2 c, in int root, in int n)
{
    float p = float(root);
    p = 1.0/p;
    float n_float = float(n);
    
    float abs_c = length(c);
    float phi = atan2(c.y, c.x);
    
    float new_phi = (phi + n_float * PI * 2.0)*p;
    float new_r = pow(abs_c, p);
    
    return  new_r * vec2(cos(new_phi), sin(new_phi));
}

vec3 test_bairstow(in vec3 ro, in vec3 rd, in vec2 torus)
{
    float a = ro.x;
    float b = ro.y;
    float c = ro.z;
    float x = rd.x;
    float y = rd.y;
    float z = rd.z;
    float w = torus.y;

    float a_0 = a * a * a * a + b * b * b * b + 2.0 * b * b * (-1.0 + c * c - w * w) + (1.0 + c * c - w * w) * (1.0 + c * c - w * w) + 2.0 * a * a * (-1.0 + b * b + c * c - w * w);
    float a_1 = 8.0 * c * z;
    float a_2 = -2.0 + 2.0 * a * a + 2.0 * b * b + 2.0 * c * c - 2.0 * w * w + 4.0 * z * z;
    float a_3 = 0.0;
    float a_4 = 1.0;
    
    float b_0;
    float b_1;
    float b_2;
    float b_3;
    float b_4;
    
    float f_0;
    float f_1;
    float f_2;
    float f_3;
    float f_4;
    
    float u = a_3 / a_4; // starting point
    float v = a_2 / a_4; // starting point
    
    float e;
    float d;
    float g;
    float h;
    
    float D;
    
    b_4 = 0.0;
    b_3 = 0.0;
    f_4 = 0.0;
    f_3 = 0.0;
    f_2 = 0.0;
    f_1 = 0.0;
    
    //if (x > 0.0) 
    //{return vec3(1.0,1.0,1.0);}
    
    // OPTIMIZE
    int j = 0;
    for (int i = 0; i<100; i++) 
    {
      j += 1;
      
      b_2 = a_4;
      b_1 = a_3 - u * b_2 - v * b_3;
      b_0 = a_2 - u * b_1 - v * b_2;
      
      f_2 = b_4;
      f_1 = b_3 - u * f_2 - v * f_3;
      f_0 = b_2 - u * f_1 - v * f_2;
      
      e = a_1 - u * b_0 - v * b_1;
      d = a_0 - v * b_0;
      g = b_1 - u * f_0 - v * f_1;
      h = b_0 - v * f_0;
      
      D = v * g * g + h * (h - u * g);
      
      u -= -(-h * e + g * d)/D;
      v -= -(-g * v * e + (g * u - h) * d)/D;
      
      if (e*e + d*d <= 0.00001) {break;}
    }
    
    bool no_real = true;
    if (u*u - 4.0 * v >= 0.0) {no_real = false;}
    if (b_1*b_1 - 4.0 * b_2 * b_0 >= 0.0) {no_real = false;}
    
    //if (no_real) {discard;}
    //return vec3(abs(e),abs(d),0.0);
    ////return vec3(b_0,b_1,b_3);
    //return vec3(float(j)/1000.0, float(j) / 1000.0, float(j) / 1000.0);
    return 1000.0*vec3(abs(u),abs(v),0.0);
}

vec2 test_smt (in vec3 ro, in vec3 rd, in vec2 torus)
{
    float a = ro.x;
    float b = ro.y;
    float c = ro.z;
    float x = rd.x;
    float y = rd.y;
    float z = rd.z;
    
    float ua = abs(ro.x);
    float ub = abs(ro.y);
    float uc = abs(ro.z);
    float ux = abs(rd.x);
    float uy = abs(rd.y);
    float uz = abs(rd.z);
    
    float w = torus.y;
    
    float alpha = 
    pow(ua,2.0)+pow(ub,2.0)+pow(uc,2.0)-pow(w,2.0)+2.0*pow(uz,2.0)-1.0;
    float beta = 
    pow(ua,4.0)+2.0*pow(ub,2.0)*pow(ua,2.0)+2.0*pow(uc,2.0)*pow(ua,2.0)-2.0*pow(w,2.0)*pow(ua,2.0)-2.0*pow(ua,2.0)+pow(ub,4.0)+pow(uc,4.0)+ pow(w,4.0)-2.0*pow(ub,2.0)+2.0*pow(ub,2.0)*pow(uc,2.0)+2.0*pow(uc,2.0)-2.0*pow(ub,2.0)*pow(w,2.0)-2.0*pow(uc,2.0)*pow(w,2.0)-2.0*pow(w,2.0)+1.0;
    float gamma = 
    16.0*alpha*alpha*alpha-144.0*beta*alpha+1728.0*(a * x + b * y)*(a * x + b * y);
    float delta =
    4.0*alpha*alpha+12.0*beta;
    
    float epsilon_sqr = gamma*gamma-4.0*delta*delta*delta;
    
    // vec2 compl_epsilon = compl_pow(vec2(epsilon_sqr, 0.0), 0.5);
    vec2 compl_epsilon = compl_nth_root(vec2(epsilon_sqr, 0.0), 2, 1);
    
    //vec2 compl_zeta = compl_pow(vec2(gamma, 0.0) + compl_epsilon,1.0/3.0);
    vec2 compl_zeta = compl_nth_root(vec2(gamma, 0.0) + compl_epsilon,3,3);
    vec2 compl_zeta_inv = compl_pow(compl_zeta, -1.0);
    
    float cubic_2 = pow(2.0,1.0/3.0);
    
    vec2 A = compl_nth_root( 1.0/(3.0 * cubic_2) * compl_zeta - vec2(4.0/3.0 * alpha, 0.0) - cubic_2/3.0 * delta * compl_zeta_inv, 2, 1);
    vec2 A_inv = compl_pow(A,-1.0);
    vec2 B = -1.0/(3.0 * cubic_2) * compl_zeta - vec2(8.0/3.0 * alpha, 0.0) - cubic_2/3.0 * delta * compl_zeta_inv;
    vec2 C = (16.0*(a*x + b*y)*A_inv);
    
    // (-,-,+,+) * A (-,+,-,+) * sqrt ( B (-,-,+,+) C)
    vec2 t_0 = 1.0/2.0 * (-A-compl_nth_root(B-C,2,0));
    vec2 t_1 = 1.0/2.0 * (-A+compl_nth_root(B-C,2,1));
    vec2 t_2 = 1.0/2.0 * (+A-compl_nth_root(B+C,2,1));
    vec2 t_3 = 1.0/2.0 * (+A+compl_nth_root(B+C,2,0));
    
    return A;
    //return 1000.0*vec2(t_1.y,0.0);
    //return t_3;
    
    //return t_0;
    //return t_1;
    //return t_2;
    //return t_3;
    //return -t_0;
    //return -t_1;
    //return -t_2;
    //return -t_3;
    
    if (abs(t_0.y) <= 0.1) { return -t_0; }
    if (abs(t_1.y) <= 0.1) { return -t_1; }
    if (abs(t_2.y) <= 0.1) { return -t_2; }
    if (abs(t_3.y) <= 0.1) { return -t_3; }
    
    discard; 
    
    // float zeta = pow((gamma + fake_epsilon) * 0.5, 1.0/3.0);
    
    // 
    // float first_sqr = zeta/3.0 - 4.0/3.0 * alpha + delta/(3.0 * zeta);
    // 
    // if (first_sqr < -1.0) { discard; }
    // if (first_sqr < 0.0)  { first_sqr = 0.0; }
    // 
    // float fake_first = pow(first_sqr, 0.5);
    // 
    // float big_sqr_first_part = -zeta/3.0 - 8.0/3.0 * alpha - delta/(3.0 * zeta);
    // float big_sqr_second_part = 16.0 * c * z / fake_first;
    // 
    // if (big_sqr_first_part - fake_first > 0.0 ) {
    //   return big_sqr_first_part - fake_first;
    // }
    // if (big_sqr_first_part + fake_first > 0.0 ) {
    //   return big_sqr_first_part + fake_first;
    // }
}



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
  if ( true ) {
    //vec2 asdf = test_smt(newStart.xyz, ray_wc.xyz, torus);
    //gl_FragColor = vec4(asdf,0.0,1.0);
    // gl_FragColor = vec4(newStart.xyz,1.0);
  
    gl_FragColor = vec4(test_bairstow(newStart.xyz, ray_wc.xyz, torus), 1.0);
    return;
  }
  
  t = iTorus(camera_wc.xyz, ray_wc.xyz, torus);
  
  
  if (t < 0.0 || t > 100.0) { discard; }

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

  float mod_x_pos = mod(+atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
  float mod_x_neg = mod(-atan2(pos.y, pos.x), 2.0*PI/boardSizeX);
  float mod_y_pos = mod(+twist+atan2(pos_rotated.x, pos_rotated.z), 2.0*PI/boardSizeY);
  float mod_y_neg = mod(-twist-atan2(pos_rotated.x, pos_rotated.z), 2.0*PI/boardSizeY);
  //col *= pow(abs(mod_x_pos * mod_x_neg * mod_y_pos * mod_y_neg), 0.2);

  col = sqrt( col );
  
  if (t < 0.6 && t > 0.55) {
    col *= 0.0;
  }
  
  gl_FragColor = vec4( col, 1.0 );
  // gl_FragDepth = t;
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
