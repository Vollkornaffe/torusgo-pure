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
        this.vertices.push(customTorusGeometry.quads[Id].position);
        this.vertices.push(customTorusGeometry.quads[nextX].position);
        this.vertices.push(customTorusGeometry.quads[Id].position);
        this.vertices.push(customTorusGeometry.quads[nextY].position);
      }
    }
  };

  updateGeometry(customTorusGeometry) {
    /*
    for (let i = 0; i < customTorusGeometry.quads.length; i++)
    {
      let nextX = customTorusGeometry.quads[i].vertices[2];
      let nextY = customTorusGeometry.quads[i].vertices[1];
      this.vertices[i+1].copy(customTorusGeometry.quads[nextX].position);
      this.vertices[i  ].copy(customTorusGeometry.quads[i].position);
      this.vertices[i+2].copy(customTorusGeometry.quads[i].position);
      this.vertices[i+3].copy(customTorusGeometry.quads[nextY].position);
    }
    */
    this.verticesNeedUpdate = true;
  };
}

export default TorusLinesGeometry;
