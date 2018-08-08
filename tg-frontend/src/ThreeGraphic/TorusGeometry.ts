import autoBind from 'react-autobind';

import { Face3, Geometry, Vector2, Vector3, } from 'three';

class TorusGeometry extends Geometry {
  private boardSizeX: number;
  private boardSizeY: number;
  private radius:     number;
  private thickness:  number;
  private twist:      number;

  public constructor(
    boardSizeX: number,
    boardSizeY: number,
    radius:     number,
    thickness:  number,
    twist:      number,
  ) {
    super();
    autoBind(this);

    this.boardSizeX = boardSizeX;
    this.boardSizeY = boardSizeY;
    this.radius     = radius    ;
    this.thickness  = thickness ;
    this.twist      = twist     ;

    console.log(boardSizeX);
    console.log(boardSizeY);
    console.log(radius    );
    console.log(thickness );
    console.log(twist     );


    this.initGeometry();
    this.updatePositions();
  }  

  public initGeometry() {
    for (let i = 0; i < this.boardSizeX; i++) {
      for (let j = 0; j < this.boardSizeY; j++) {
        this.vertices.push(new Vector3());
        this.addQuad(i,j);
      }
    }
// 
//     this.faceVertexUvs = [[]];
//     for (let i = 0; i < this.faces.length; i++) {
//       if (i%2 === 0) {
//         this.faceVertexUvs[0].push(this.face1UV);
//       } else {
//         this.faceVertexUvs[0].push(this.face2UV);
//       }
//     }
// 
    // this.dynamic = true;
//     this.uvsNeedUpdate = true;
  }

  public updatePositions() {
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


      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < this.boardSizeY; j++) {
        const vId = this.canonPos(i, j);
        const jRad = j / this.boardSizeY * 2 * Math.PI;

        // first copy the ring position
        this.vertices[vId].copy(offset);
        // then put it at the disired radius, in y-direction
        this.vertices[vId].addScaledVector(yAxis, this.radius);
        this.vertices[vId].applyAxisAngle(xAxis, jRad);
      }
    }

    this.verticesNeedUpdate = true;
    this.computeVertexNormals();

  }

  private canonPos(x: number, y: number) {
    const xMod = x % this.boardSizeX;
    const yMod = y % this.boardSizeY;
    const xModAbs = xMod >= 0 ? xMod : this.boardSizeX + xMod;
    const yModAbs = yMod >= 0 ? yMod : this.boardSizeY + yMod;
    return xModAbs + this.boardSizeX * yModAbs;
  }

  private addQuad(x: number, y: number) {
    const a = this.canonPos(x,   y);
    const b = this.canonPos(x+1, y);
    const c = this.canonPos(x+1, y+1);
    const d = this.canonPos(x,   y+1);
    
    this.faces.push(new Face3(a,b,c));
    this.faces.push(new Face3(a,c,d));
  }
  
}

export default TorusGeometry;
