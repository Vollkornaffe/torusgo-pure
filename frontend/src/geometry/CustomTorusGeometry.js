import autoBind from 'react-autobind';

import {Vector3, Face3, Geometry, Vector2} from 'three';

const TORUS_RADIUS = 2;
const TORUS_THICKNESS = 1.5;

class Quad {
  constructor(vertices, faces, x, y) {
    this.vertices = vertices;
    this.faces = faces || [];
    this.faces.forEach((face) => {
      face.quad = this;
    });
    this.coordSystem = {
      x: new Vector3(),
      y: new Vector3(),
      z: new Vector3()
    };
    this.position = new Vector3();
    this.edgePosX = new Vector3();
    this.edgePosY = new Vector3();
    this.x = x;
    this.y = y;
  }

  setColor(...args) {
    this.faces.forEach((face) => {
      face.color.setRGB(...args);
    })
  }
}

class CustomTorusGeometry extends Geometry {

  constructor(XSegments, YSegments) {
    super();
    
    autoBind(this);
  
    this.parameters = {
      radius: TORUS_RADIUS,
      thickness: TORUS_THICKNESS,
      XSegments: XSegments,
      YSegments: YSegments,
      twist: 0,
    };
  
    // Indices for convenience
    this.adjecentFaces = []; // Vertex -> faces

    this.quads = [];
    this.face1UV = [
      new Vector2(0, 0),
      new Vector2(1, 0),
      new Vector2(1, 1),
    ];
    this.face2UV = [
      new Vector2(0, 0),
      new Vector2(1, 1),
      new Vector2(0, 1),
    ];

    this.initGeometry();
    this.updateGeometry();
  }

  calcCanonPos (x,y) {
    let x_mod = x % this.parameters.XSegments;
    let y_mod = y % this.parameters.YSegments;
    let x_mod_abs = x_mod >= 0 ? x_mod : this.parameters.XSegments + x_mod;
    let y_mod_abs = y_mod >= 0 ? y_mod : this.parameters.YSegments + y_mod;
    return x_mod_abs + this.parameters.XSegments * y_mod_abs;
  }

  /**
   * takes Vertex indices and
   * establishes the correct connectivity
   * so that the triangle faces are added to geometry
   * and also fills "adjecentFaces" & "quadFaces"
   */
  addFaces(vertices, idx, i, j) {
    vertices.forEach((entry)=> {
      if (this.adjecentFaces[entry] === undefined) {
        this.adjecentFaces[entry] = [];
      }
    });

    let [a,b,c,d] = vertices;

    let tmp;

    let face1 = new Face3(a,b,c);
    this.faces.push(face1);
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    let face2 = new Face3(a,c,d);
    this.faces.push(face2);
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    this.quads[idx] = new Quad(vertices, [face1, face2], i, j);

    if(j === 0 && i === 0 ) {
      this.quads[idx].setColor(0x008800);
    }
  }

  /**
   * creates connectivity (vertices, faces and quads)
   */
  initGeometry() {
    for (let i = 0; i < this.parameters.XSegments; i++) {
      for (let j = 0; j < this.parameters.YSegments; j++) {

        this.vertices.push(new Vector3());

        // generate faces and quads very easy
        this.addFaces([
          this.calcCanonPos(i,j),
          this.calcCanonPos(i+1,j),
          this.calcCanonPos(i+1,j+1),
          this.calcCanonPos(i,j+1)
        ], this.calcCanonPos(i,j), i, j);

      }
    }

    this.faceVertexUvs = [[]];
    for (let i = 0; i < this.faces.length; i++) {
      if (i%2 == 0) {
        this.faceVertexUvs[0].push(this.face1UV);
      } else {
        this.faceVertexUvs[0].push(this.face2UV);
      }
    }

    this.dynamic = true;
    this.uvsNeedUpdate = true;
  }

  /**
   * called for initialization and
   * should be called whenever the twist parameter is changed
   */
  updateGeometry () {
    // for conviniece
    let x_seg = this.parameters.XSegments;
    let y_seg = this.parameters.YSegments;

    // axis
    let x_ax = new Vector3(1,0,0);
    let y_ax = new Vector3(0,1,0);

    for (let i = 0; i < x_seg; i++) {

      // this is where the TWIST has an influence!
      let i_rad = i / x_seg * 2 * Math.PI + this.parameters.twist;
      let i_rad_middle = (i + 0.5) / x_seg * 2 * Math.PI + this.parameters.twist;


      // first we compute the 'offsets', meaning one of many identical 'ring' segments
      let offset = new Vector3(
        this.parameters.thickness * Math.cos(i_rad),
        this.parameters.thickness * Math.sin(i_rad),
        0
      );
      let offset_middle = new Vector3(
        this.parameters.thickness * Math.cos(i_rad_middle),
        this.parameters.thickness * Math.sin(i_rad_middle),
        0
      );

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < y_seg; j++) {
        let vId = this.calcCanonPos(i,j);;

        let j_rad = j / y_seg * 2 * Math.PI;
        let j_rad_middle = (j + 0.5) / y_seg * 2 * Math.PI;

        // individual vertex positions
        let newPos = new Vector3();
        let newPosMiddle = new Vector3();
        let newPosEdgeX = new Vector3();
        let newPosEdgeY = new Vector3();
        // individual vertex normals
        let newNor = new Vector3();
        let newNorMiddle = new Vector3();

        // first copy the ring position
        newPos.copy(offset);
        newPosMiddle.copy(offset_middle);
        newPosEdgeX.copy(offset_middle);
        newPosEdgeY.copy(offset);

        newNor.copy(offset).normalize();
        newNorMiddle.copy(offset_middle).normalize();


        // individual rotated vertex normals
        let newRotNorMiddle = newNorMiddle.clone();
        newRotNorMiddle.setX(newNorMiddle.y);
        newRotNorMiddle.setY(-newNorMiddle.x);

        // then put it at the disired radius, in y-direction
        newPos.addScaledVector(y_ax, this.parameters.radius);
        newPosMiddle.addScaledVector(y_ax, this.parameters.radius);
        newPosEdgeX.addScaledVector(y_ax, this.parameters.radius);
        newPosEdgeY.addScaledVector(y_ax, this.parameters.radius);
        // and rotate it around the x-axis to get to the final position
        newPos.applyAxisAngle(x_ax, j_rad);
        newPosMiddle.applyAxisAngle(x_ax, j_rad_middle);
        newPosEdgeX.applyAxisAngle(x_ax, j_rad);
        newPosEdgeY.applyAxisAngle(x_ax, j_rad_middle);

        newNor.applyAxisAngle(x_ax, j_rad);
        newNorMiddle.applyAxisAngle(x_ax, j_rad_middle);
        newRotNorMiddle.applyAxisAngle(x_ax, j_rad_middle);

        // Position: DONE
        this.vertices[vId].copy(newPos);

        this.quads[vId].coordSystem.x.copy(newRotNorMiddle);
        this.quads[vId].coordSystem.y.crossVectors(newNorMiddle, newRotNorMiddle);
        this.quads[vId].coordSystem.z.copy(newNorMiddle);

        this.quads[vId].edgePosX = newPosEdgeX;
        this.quads[vId].edgePosY = newPosEdgeY;

        this.quads[vId].position.copy(newPosMiddle);
        this.quads[vId].faces.forEach((face) => { face.normal.copy(newNorMiddle);
        });
      }
    }

    this.verticesNeedUpdate = true;
    this.normalsNeedUpdate = true;
    //this.computeVertexNormals();
  }
}

export default CustomTorusGeometry;
