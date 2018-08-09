import autoBind from 'react-autobind';

import { Face3, Geometry, Vector2, Vector3, } from 'three';

class TorusGeometryGeneral extends Geometry {
  public quads: Array<{
    vertices: number[];
    middle: THREE.Vector3;
    normal: THREE.Vector3;
    offMid: THREE.Vector3;
  }>;

  public boardSizeX: number;
  public boardSizeY: number;

  private radius:    number;
  private thickness: number;
  private twist:     number;

  private lineOff:   number;

  private vertexNormals: THREE.Vector3[];
  
  public constructor(
    boardSizeX: number,
    boardSizeY: number,
    radius:     number,
    thickness:  number,
    twist:      number,
    lineOff:    number,
  ) {
    super();
    autoBind(this);

    this.boardSizeX = boardSizeX;
    this.boardSizeY = boardSizeY;
    this.radius     = radius    ;
    this.thickness  = thickness ;
    this.twist      = twist     ;
    this.lineOff    = lineOff   ;

    this.quads = [];
    this.vertexNormals = [];

    this.initGeometry();
  }

  public initGeometry() {
    for (let i = 0; i < this.boardSizeX; i++) {
      for (let j = 0; j < this.boardSizeY; j++) {
        this.vertices.push(new Vector3());
        this.vertexNormals.push(new Vector3());
        this.addField(i,j);
      }
    }
  }

  public update() {
    // axis
    const xAxis = new Vector3(1, 0, 0);
    const yAxis = new Vector3(0, 1, 0);

    for (let i = 0; i < this.boardSizeX; i++) {
      // this is where the TWIST has an influence!
      const iRad = i / this.boardSizeX * 2 * Math.PI + this.twist;

      const offset = new Vector3(
        this.thickness * Math.cos(iRad),
        this.thickness * Math.sin(iRad),
        0,
      );
      const offsetNormalized = new Vector3();
      offsetNormalized.copy(offset);
      offsetNormalized.normalize();

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < this.boardSizeY; j++) {
        const vId = this.canonPos(i, j);
        const jRad = j / this.boardSizeY * 2 * Math.PI;

        // first copy the ring position
        this.vertices[vId].copy(offset);
        this.vertexNormals[vId].copy(offsetNormalized);
        // then put it at the disired radius, in y-direction
        // not for normals!
        this.vertices[vId].addScaledVector(yAxis, this.radius);
        // and rotate to position
        this.vertices[vId].applyAxisAngle(xAxis, jRad);
        this.vertexNormals[vId].applyAxisAngle(xAxis, jRad);
      }
    }

    for (const quad of this.quads) {
      quad.middle.set(0,0,0);
      quad.middle.addScaledVector(this.vertices[quad.vertices[0]], 0.25);
      quad.middle.addScaledVector(this.vertices[quad.vertices[1]], 0.25);
      quad.middle.addScaledVector(this.vertices[quad.vertices[2]], 0.25);
      quad.middle.addScaledVector(this.vertices[quad.vertices[3]], 0.25);

      quad.normal.set(0,0,0);
      quad.normal.addScaledVector(this.vertexNormals[quad.vertices[0]], 0.25);
      quad.normal.addScaledVector(this.vertexNormals[quad.vertices[1]], 0.25);
      quad.normal.addScaledVector(this.vertexNormals[quad.vertices[2]], 0.25);
      quad.normal.addScaledVector(this.vertexNormals[quad.vertices[3]], 0.25);

      quad.offMid.copy(quad.middle);
      quad.offMid.addScaledVector(quad.normal, this.lineOff);
    }
  }

  public canonPos(x: number, y: number) {
    const xMod = x % this.boardSizeX;
    const yMod = y % this.boardSizeY;
    const xModAbs = xMod >= 0 ? xMod : this.boardSizeX + xMod;
    const yModAbs = yMod >= 0 ? yMod : this.boardSizeY + yMod;
    return xModAbs + this.boardSizeX * yModAbs;
  }

  private addField(x: number, y: number) {
    this.quads.push({
      "vertices": [
        this.canonPos(x,   y),
        this.canonPos(x+1, y),
        this.canonPos(x+1, y+1),
        this.canonPos(x,   y+1),
      ],
      "middle": new Vector3(),
      "normal": new Vector3(),
      "offMid": new Vector3(),
    });
  }
}

export default TorusGeometryGeneral;
