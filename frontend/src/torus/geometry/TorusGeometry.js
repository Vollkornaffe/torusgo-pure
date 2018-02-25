import autoBind from 'react-autobind';

import {Vector3, Face3, Geometry, Vector2} from 'three';

const TORUS_RADIUS = 2;
const TORUS_THICKNESS = 1.5;

/**
 * @class Quad
 */
class Quad {
  /**
   * @param {array<Vector3>} vertices
   * @param {array<Face3>} faces
   * @param {number} x
   * @param {number} y
   */
  constructor(vertices, faces, x, y) {
    this.vertices = vertices;
    this.faces = faces || [];
    this.faces.forEach((face) => {
      face.quad = this;
    });
    this.coordSystem = {
      x: new Vector3(),
      y: new Vector3(),
      z: new Vector3(),
    };

    // these are the "true" positions on a perfect torus
    this.position = new Vector3();
    this.edgePosX = new Vector3();
    this.edgePosY = new Vector3();
    this.x = x;
    this.y = y;

    // since we dicretize the torus, the true positions look weird
    this.discreteMid = new Vector3();
    this.discreteEdgeX = new Vector3();
    this.discreteEdgeY = new Vector3();
    this.discreteScale = 0.0;
  }

  /**
   * @param {object} args
   */
  setColorRGB(...args) {
    this.faces.forEach((face) => {
      face.color.setRGB(...args);
    });
  }

  /**
   * @param {object} args
   */
  setColorHex(...args) {
    this.faces.forEach((face) => {
      face.color.setHex(...args);
    });
  }
}

/**
 * @class TorusGeometry
 */
class TorusGeometry extends Geometry {
  /**
   * @param {number} XSegments
   * @param {number} YSegments
   */
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

    // to aviod z-fighting
    this.vertices_withOffset = [];

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

  /**
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  calcCanonPos(x, y) {
    let xMod = x % this.parameters.XSegments;
    let yMod = y % this.parameters.YSegments;
    let xModAbs = xMod >= 0 ? xMod : this.parameters.XSegments + xMod;
    let yModAbs = yMod >= 0 ? yMod : this.parameters.YSegments + yMod;
    return xModAbs + this.parameters.XSegments * yModAbs;
  }

  /**
   * takes Vertex indices and establishes the correct connectivity
   * so that the triangle faces are added to geometry
   * and also fills "adjecentFaces" & "quadFaces"
   * @param {array} vertices
   * @param {number} idx
   * @param {number} i
   * @param {number} j
   */
  addFaces(vertices, idx, i, j) {
    vertices.forEach((entry)=> {
      if (this.adjecentFaces[entry] === undefined) {
        this.adjecentFaces[entry] = [];
      }
    });

    let [a, b, c, d] = vertices;

    let tmp;

    let face1 = new Face3(a, b, c);
    this.faces.push(face1);
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    let face2 = new Face3(a, c, d);
    this.faces.push(face2);
    tmp = 0;
    vertices.forEach((entry)=> {
      this.adjecentFaces[entry].push([tmp, this.faces.length-1]);
      tmp++;
    });

    this.quads[idx] = new Quad(vertices, [face1, face2], i, j);
  }

  /**
   * creates connectivity (vertices, faces and quads)
   */
  initGeometry() {
    for (let i = 0; i < this.parameters.XSegments; i++) {
      for (let j = 0; j < this.parameters.YSegments; j++) {
        this.vertices.push(new Vector3());
        this.vertices_withOffset.push(new Vector3());

        // generate faces and quads very easy
        this.addFaces([
          this.calcCanonPos(i, j),
          this.calcCanonPos(i+1, j),
          this.calcCanonPos(i+1, j+1),
          this.calcCanonPos(i, j+1),
        ], this.calcCanonPos(i, j), i, j);
      }
    }

    this.faceVertexUvs = [[]];
    for (let i = 0; i < this.faces.length; i++) {
      if (i%2 === 0) {
        this.faceVertexUvs[0].push(this.face1UV);
      } else {
        this.faceVertexUvs[0].push(this.face2UV);
      }
    }

    this.dynamic = true;
    this.uvsNeedUpdate = true;
  }

  /**
   * linear interpolation of the discrete face and edge middlepoints
   *
   * stupid inefficient function
   * now we have to iterate over the whole thing again,
   * we might aswell split up each face into 4 subfaces and use the
   * "true" coordinates there
   */
  interpolateDiscrete() {
    const vert = this.vertices_withOffset;
    this.quads.forEach((quad) => {
      quad.discreteEdgeX.set(0, 0, 0);
      quad.discreteEdgeY.set(0, 0, 0);
      quad.discreteMid.set(0, 0, 0);
      quad.discreteEdgeX.addScaledVector(vert[quad.vertices[0]], 0.5);
      quad.discreteEdgeX.addScaledVector(vert[quad.vertices[1]], 0.5);
      quad.discreteEdgeY.addScaledVector(vert[quad.vertices[0]], 0.5);
      quad.discreteEdgeY.addScaledVector(vert[quad.vertices[3]], 0.5);
      quad.discreteMid.addScaledVector(vert[quad.vertices[0]], 0.25);
      quad.discreteMid.addScaledVector(vert[quad.vertices[1]], 0.25);
      quad.discreteMid.addScaledVector(vert[quad.vertices[2]], 0.25);
      quad.discreteMid.addScaledVector(vert[quad.vertices[3]], 0.25);

      quad.discreteScale = quad.discreteMid.distanceTo(quad.discreteEdgeX);
    });
  }

  /**
   * called for initialization and
   * should be called whenever the twist parameter is changed
   */
  updateGeometry() {
    // for conviniece
    let xSeg = this.parameters.XSegments;
    let ySeg = this.parameters.YSegments;

    // axis
    let xAxis = new Vector3(1, 0, 0);
    let yAxis = new Vector3(0, 1, 0);

    for (let i = 0; i < xSeg; i++) {
      // this is where the TWIST has an influence!
      let iRad = i / xSeg * 2 * Math.PI + this.parameters.twist;
      let iRadMiddle = (i + 0.5) / xSeg * 2 * Math.PI + this.parameters.twist;


      // first we compute the 'offsets',
      // meaning one of many identical 'ring' segments
      let offset = new Vector3(
        this.parameters.thickness * Math.cos(iRad),
        this.parameters.thickness * Math.sin(iRad),
        0
      );
      let offsetEps = new Vector3(
        this.parameters.thickness * Math.cos(iRad) * 1.01,
        this.parameters.thickness * Math.sin(iRad) * 1.01,
        0
      );
      let offsetMiddle = new Vector3(
        this.parameters.thickness * Math.cos(iRadMiddle),
        this.parameters.thickness * Math.sin(iRadMiddle),
        0
      );

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < ySeg; j++) {
        let vId = this.calcCanonPos(i, j);

        let jRad = j / ySeg * 2 * Math.PI;
        let jRadMiddle = (j + 0.5) / ySeg * 2 * Math.PI;

        // individual vertex positions
        let newPos = new Vector3();
        let newPosEps = new Vector3();
        let newPosMiddle = new Vector3();
        let newPosEdgeX = new Vector3();
        let newPosEdgeY = new Vector3();
        // individual vertex normals
        let newNor = new Vector3();
        let newNorMiddle = new Vector3();

        // first copy the ring position
        newPos.copy(offset);
        newPosEps.copy(offsetEps);
        newPosMiddle.copy(offsetMiddle);
        newPosEdgeX.copy(offsetMiddle);
        newPosEdgeY.copy(offset);

        newNor.copy(offset).normalize();
        newNorMiddle.copy(offsetMiddle).normalize();


        // individual rotated vertex normals
        let newRotNorMiddle = newNorMiddle.clone();
        newRotNorMiddle.setX(newNorMiddle.y);
        newRotNorMiddle.setY(-newNorMiddle.x);

        // then put it at the disired radius, in y-direction
        newPos.addScaledVector(yAxis, this.parameters.radius);
        newPosEps.addScaledVector(yAxis, this.parameters.radius);
        newPosMiddle.addScaledVector(yAxis, this.parameters.radius);
        newPosEdgeX.addScaledVector(yAxis, this.parameters.radius);
        newPosEdgeY.addScaledVector(yAxis, this.parameters.radius);
        // and rotate it around the x-axis to get to the final position
        newPos.applyAxisAngle(xAxis, jRad);
        newPosEps.applyAxisAngle(xAxis, jRad);
        newPosMiddle.applyAxisAngle(xAxis, jRadMiddle);
        newPosEdgeX.applyAxisAngle(xAxis, jRad);
        newPosEdgeY.applyAxisAngle(xAxis, jRadMiddle);

        newNor.applyAxisAngle(xAxis, jRad);
        newNorMiddle.applyAxisAngle(xAxis, jRadMiddle);
        newRotNorMiddle.applyAxisAngle(xAxis, jRadMiddle);

        // Position: DONE
        this.vertices[vId].copy(newPos);
        this.vertices_withOffset[vId].copy(newPosEps);

        let quad = this.quads[vId];

        quad.coordSystem.x.copy(newRotNorMiddle);
        quad.coordSystem.y.crossVectors(newNorMiddle, newRotNorMiddle);
        quad.coordSystem.z.copy(newNorMiddle);

        quad.edgePosX.copy(newPosEdgeX);
        quad.edgePosY.copy(newPosEdgeY);
        quad.position.copy(newPosMiddle);
        quad.faces.forEach((face) => face.normal.copy(newNorMiddle));
      }
    }

    this.verticesNeedUpdate = true;
    this.normalsNeedUpdate = true;
    // this.computeVertexNormals();

    this.interpolateDiscrete();
  }
}

export default TorusGeometry;
