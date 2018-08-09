import {Geometry, Vector3, } from 'three';
import TorusGeometryGeneral from './TorusGeometryGeneral';

class TorusLinesGeometry extends Geometry {
  public constructor(torusGeometryGeneral: TorusGeometryGeneral) {
    super();

    for (let i = 0; i < torusGeometryGeneral.boardSizeX; i++) {
      for (let j = 0; j < torusGeometryGeneral.boardSizeY; j++) {
        const Id    = torusGeometryGeneral.canonPos(i, j);
        const nextX = torusGeometryGeneral.canonPos(i + 1, j);
        const nextY = torusGeometryGeneral.canonPos(i, j + 1);
        this.vertices.push(torusGeometryGeneral.quads[Id   ].offMid);
        this.vertices.push(torusGeometryGeneral.quads[nextX].offMid);
        this.vertices.push(torusGeometryGeneral.quads[Id   ].offMid);
        this.vertices.push(torusGeometryGeneral.quads[nextY].offMid);
      }
    }
  }

  public update() {
    this.verticesNeedUpdate = true;
  };
}

export default TorusLinesGeometry;
