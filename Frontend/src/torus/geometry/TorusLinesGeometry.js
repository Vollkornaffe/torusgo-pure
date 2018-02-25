import autoBind from 'react-autobind';
import {Geometry} from 'three';

/**
 * @class TorusLinesGeometry
 */
class TorusLinesGeometry extends Geometry {
  /**
   * @constructor
   * @param {TorusGeometry} torusGeometry
   */
  constructor(torusGeometry) {
    super();
    autoBind(this);

    this.initGeometry(torusGeometry);
    this.updateGeometry();
  };

  /**
   * @param {TorusGeometry} torusGeometry
   */
  initGeometry(torusGeometry) {
    for (let i = 0; i < torusGeometry.parameters.XSegments; i++) {
      for (let j = 0; j < torusGeometry.parameters.YSegments; j++) {
        let Id = torusGeometry.calcCanonPos(i, j);
        let nextX = torusGeometry.calcCanonPos(i + 1, j);
        let nextY = torusGeometry.calcCanonPos(i, j + 1);
        this.vertices.push(torusGeometry.quads[Id].discreteEdgeX);
        this.vertices.push(torusGeometry.quads[nextY].discreteEdgeX);
        this.vertices.push(torusGeometry.quads[Id].discreteEdgeY);
        this.vertices.push(torusGeometry.quads[nextX].discreteEdgeY);
      }
    }
  };

  /**
   */
  updateGeometry() {
    this.verticesNeedUpdate = true;
  };
}

export default TorusLinesGeometry;
