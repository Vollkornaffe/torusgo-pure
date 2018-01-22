import autoBind from 'react-autobind';

import { Vector3, Face3, Geometry } from 'three';

class Quad {
  constructor(faces, x, y) {
    this.faces = faces || [];
    this.faces.forEach((face) => {
      face.quad = this;
    });
    this.coordSystem = {};
    this.position = {};
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

  constructor(radius, thickness, XSegments, YSegments) {
    super();
    
    autoBind(this);
  
    this.parameters = {
      radius: radius,
      thickness: thickness,
      XSegments: XSegments,
      YSegments: YSegments,
      twist: 0.0,
    };
  
    // Indices for convenience
    this.adjecentFaces = []; // Vertex -> faces

    this.quads = [];
    
    this.initGeometry();
    this.updateGeometry();
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

    this.quads[idx] = new Quad([face1, face2], i, j);
  }

  /**
   * creates connectivity (vertices, faces and quads)
   */
  initGeometry() {

    // vertex id
    let vId = 0;

    // for conveniece
    let x_seg = this.parameters.XSegments;
    let y_seg = this.parameters.YSegments;

    for (let i = 0; i < x_seg; i++) {
      for (let j = 0; j < y_seg; j++) {

        this.vertices.push(new Vector3());

        // generate faces and quads
        if (i !== 0 && j !== 0) {
          this.addFaces([vId - y_seg, vId - 1 - y_seg, vId - 1, vId], vId - 1 - y_seg, i-1, j-1);

          if (j === y_seg - 1) {
            this.addFaces([vId, vId - y_seg + 1, vId - y_seg - y_seg + 1, vId - y_seg], vId - y_seg, i-1, j);
          }
          if (i === x_seg - 1) {
            this.addFaces([vId, vId - 1,j - 1, j], vId - 1, i, j-1);
          }
          if (i === x_seg - 1 && j === y_seg - 1) {
            this.addFaces([vId - y_seg + 1,vId,j, 0], vId, i, j);
          }
        }

        vId++;

      }
    }

    this.dynamic = true;
  }

  /**
   * called for initialization and
   * should be called whenever the twist parameter is changed
   */
  updateGeometry () {
    // vertex id
    let vId = 0;

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
        this.parameters.thickness * Math.cos(i_rad_middle) * 1.01,
        this.parameters.thickness * Math.sin(i_rad_middle) * 1.01,
        0
      );

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < y_seg; j++) {
        let j_rad = j / y_seg * 2 * Math.PI;

        let j_rad_middle = (j + 0.5) / y_seg * 2 * Math.PI;

        // individual vertex positions
        let newPos = new Vector3();
        let newPosMiddle = new Vector3();
        // individual vertex normals
        let newNor = new Vector3();
        let newNorMiddle = new Vector3();

        // first copy the ring position
        newPos.copy(offset);
        newPosMiddle.copy(offset_middle);

        newNor.copy(offset).normalize();
        newNorMiddle.copy(offset_middle).normalize();


        // individual rotated vertex normals
        let newRotNorMiddle = newNorMiddle.clone();
        newRotNorMiddle.setX(newNorMiddle.y);
        newRotNorMiddle.setY(-newNorMiddle.x);

        // then put it at the disired radius, in y-direction
        newPos.addScaledVector(y_ax, this.parameters.radius);
        newPosMiddle.addScaledVector(y_ax, this.parameters.radius);
        // and rotate it around the x-axis to get to the final position
        newPos.applyAxisAngle(x_ax, j_rad);
        newPosMiddle.applyAxisAngle(x_ax, j_rad_middle);
        newNor.applyAxisAngle(x_ax, j_rad);
        newNorMiddle.applyAxisAngle(x_ax, j_rad_middle);
        newRotNorMiddle.applyAxisAngle(x_ax, j_rad_middle);

        // Position: DONE
        this.vertices[vId].copy(newPos);

        this.quads[vId].coordSystem = {
          x: newRotNorMiddle,
          y: (new Vector3()).crossVectors(newNorMiddle, newRotNorMiddle),
          z: newNorMiddle
        };
        this.quads[vId].position = newPosMiddle;
        this.quads[vId].faces.forEach((face) => {
          face.normal.copy(newNorMiddle);
        });

        vId++;
      }
    }

    this.verticesNeedUpdate = true;
    this.normalsNeedUpdate = true;
    //this.computeVertexNormals();
  }
}

export default CustomTorusGeometry;
