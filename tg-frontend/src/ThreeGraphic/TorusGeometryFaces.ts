import {Face3, Geometry} from 'three';

import TorusGeometryGeneral from './TorusGeometryGeneral';

class TorusGeometryFaces extends Geometry {
  public constructor(torusGeometryGeneral: TorusGeometryGeneral) {
    super();

    this.vertices = torusGeometryGeneral.vertices;
    for (const quad of torusGeometryGeneral.quads) {
      const vs = quad.vertices;
      this.faces.push(new Face3(vs[0],vs[1],vs[2]));
      this.faces.push(new Face3(vs[0],vs[2],vs[3]));
    }
  }

  public update() {
    this.verticesNeedUpdate = true;
    this.computeVertexNormals();
  }
}

export default TorusGeometryFaces;
