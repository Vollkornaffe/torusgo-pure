import autoBind from 'react-autobind';
import {Vector3, Geometry} from 'three';

class TorusLinesGeometry extends Geometry {
  constructor(customTorusGeometry) {
    super();

    autoBind(this);

    this.initGeometry(customTorusGeometry);
    this.updateGeometry(customTorusGeometry);
  };

  initGeometry(customTorusGeometry) {
    for (let i = 0; i < customTorusGeometry.parameters.XSegments; i++) {
      for (let j = 0; j < customTorusGeometry.parameters.YSegments; j++) {
        let Id = customTorusGeometry.calcCanonPos(i, j);
        let nextX = customTorusGeometry.calcCanonPos(i + 1, j);
        let nextY = customTorusGeometry.calcCanonPos(i, j + 1);
        this.vertices.push(customTorusGeometry.quads[Id].discreteEdgeX);
        this.vertices.push(customTorusGeometry.quads[nextY].discreteEdgeX);
        this.vertices.push(customTorusGeometry.quads[Id].discreteEdgeY);
        this.vertices.push(customTorusGeometry.quads[nextX].discreteEdgeY);
      }
    }
  };

  updateGeometry(customTorusGeometry) {
    this.verticesNeedUpdate = true;
  };
}

export default TorusLinesGeometry;
