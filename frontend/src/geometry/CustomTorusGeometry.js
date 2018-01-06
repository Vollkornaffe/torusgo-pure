import autoBind from 'react-autobind';

import { Vector3, Face3, Geometry } from 'three';

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
    this.quadFaces = [];     // Quads  -> Vertices
    
    // Local coordinate system, for rendering stones
    this.quadCoords = [];
    
    this.initGeometry();
    this.updateGeometry();
  }

  /**
   * takes Vertex indices and
   * establishes the correct connectivity
   * so that the triangle faces are added to geometry
   * and also fills "adjecentFaces" & "quadFaces"
   */
  addFaces(vertices, idx) {
    vertices.forEach((entry)=> {
      if (this.adjecentFaces[entry] == undefined) {
        this.adjecentFaces[entry] = [];
      }
    });

    let [a,b,c,d] = vertices;

    let tmp;

    this.faces.push(new Face3(a,b,c));
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    this.faces.push(new Face3(a,c,d));
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    this.quadFaces[idx] = [a,b,c,d];
  }

  /**
   * creates connectivity (faces and quadFaces)
   */
  initGeometry() {

    // vertex id
    let vId = 0;

    // for conveniece
    let x_seg = this.parameters.XSegments;
    let y_seg = this.parameters.YSegments;

    for (let i = 0; i < x_seg; i++) {
      for (let j = 0; j < y_seg; j++) {

        // generate faces and quadFaces
        if (i !== 0 && j !== 0) {
          this.addFaces([vId - y_seg, vId - 1 - y_seg, vId - 1, vId], vId);

          if (j === y_seg - 1) {
            this.addFaces([vId, vId - y_seg + 1, vId - y_seg - y_seg + 1, vId - y_seg], vId);
          }
          if (i === x_seg - 1) {
            this.addFaces([vId, vId - 1,j - 1, j], vId);
          }
          if (i === x_seg - 1 && j === y_seg - 1) {
            this.addFaces([vId - y_seg + 1,vId,j, 0], vId);
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
  updateGeometry = function () {
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

      // first we compute the 'offsets', meaning one of many identical 'ring' segments
      let offset = new Vector3(
        this.parameters.thickness * Math.cos(i_rad),
        this.parameters.thickness * Math.sin(i_rad),
        0
      );

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < y_seg; j++) {
        let j_rad = j / x_seg * 2 * Math.PI;

        // individual vertex positions
        let newPos = new Vector3();
        // individual vertex normals
        let newNor = new Vector3();

        // first copy the ring position
        newPos.copy(offset);
        newNor.copy(offset);

        // then put it at the disired radius, in y-direction
        newPos.addScaledVector(y_ax, this.parameters.radius);

        // and rotate it around the x-axis to get to the final position
        newPos.applyAxisAngle(x_ax, j_rad);
        newNor.applyAxisAngle(x_ax, j_rad);

        // Position: DONE
        this.vertices.push(newPos);

        newNor.normalize();
        this.adjecentFaces[vId].forEach(([localIdx, faceIdx])=> {
          this.faces[faceIdx].vertexNormals[localIdx] = newNor;
          this.faces[faceIdx].normal.add(newNor);
        });

        vId++;
      }
    }

    this.faces.forEach((face)=> {
      face.normal.normalize();
    });

    this.verticesNeedUpdate = true;
    //this.computeVertexNormals();
  }
}

export default CustomTorusGeometry;
