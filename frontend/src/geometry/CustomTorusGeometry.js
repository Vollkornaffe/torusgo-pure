import { Vector3, Face3, Geometry } from 'three';

function CustomTorusGeometry(radius, thickness, XSegments, YSegments) {

	Geometry.call(this);

	this.parameters = {
		radius: radius,
		thickness: thickness,
		XSegments: XSegments,
		YSegments: YSegments,
		twist: 0.0,
	};

	// Indices for convinience
	this.quadFaces = [];
	// Normals since we can compute them efficiently on the way
	this.quadNormals = [];

	/**
	 * creates connectivity (faces and quadFaces)
 	 */
	this.initGeometry = function() {

		// vertex id
		var vId = 0;

		// for conviniece
		var x_seg = this.parameters.XSegments;
		var y_seg = this.parameters.YSegments;

		for (var i = 0; i < x_seg; i++) {
			for (var j = 0; j < y_seg; j++) {

				// generate faces and quadFaces
				if (i !== 0 && j !== 0) {
					this.faces.push(new Face3(vId, vId - 1, vId - y_seg));
					this.faces.push(new Face3(vId - 1, vId - y_seg, vId - 1 - y_seg));
					this.quadFaces[vId] = [vId, vId - 1, vId - y_seg, vId - 1 - y_seg];

					if (j === y_seg - 1) {
						this.faces.push(new Face3(vId - y_seg + 1, vId, vId - y_seg - y_seg + 1));
						this.faces.push(new Face3(vId, vId - y_seg - y_seg + 1, vId - y_seg));
						this.quadFaces[vId - y_seg + 1] = [vId - y_seg + 1, vId, vId - y_seg - y_seg + 1, vId - y_seg];
					}
					if (i === x_seg - 1) {
						this.faces.push(new Face3(j, j - 1, vId));
						this.faces.push(new Face3(j - 1, vId, vId - 1));
						this.quadFaces[j] = [j, j - 1, vId, vId - 1];
					}
					if (i === x_seg - 1 && j === y_seg - 1) {
						this.faces.push(new Face3(0, j, vId - y_seg + 1));
						this.faces.push(new Face3(j, vId - y_seg + 1, vId));
						this.quadFaces[0] = [0, j, vId - y_seg + 1, vId];
					}
				}

				vId++;

			}
		}

		this.dynamic = true;
	};

	/**
	 * called for initialization and
	 * should be called whenever the twist parameter is changed
	 */
	this.updateGeometry = function () {

		// for conviniece
		var x_seg = this.parameters.XSegments;
		var y_seg = this.parameters.YSegments;

		// axis
		var x_ax = new Vector3(1,0,0);
		var y_ax = new Vector3(0,1,0);

		for (var i = 0; i < x_seg; i++) {

			// this is where the TWIST has an influence!
			var i_rad = i / x_seg * 2 * Math.PI + this.parameters.twist;

			// first we compute the 'offsets', meaning one of many identical 'ring' segments
			var offset = new Vector3(
				this.parameters.thickness * Math.cos(i_rad),
				this.parameters.thickness * Math.sin(i_rad),
				0
			);

			// now we can spin the ring to form a complete torus!
			for (var j = 0; j < y_seg; j++) {
				var j_rad = j / x_seg * 2 * Math.PI;

				// individual vertex positions
				var newPos = new Vector3();

				// first copy the ring position
				newPos.copy(offset);

				// then put it at the disired radius, in y-direction
				newPos.addScaledVector(y_ax, this.parameters.radius);

				// and rotate it around the x-axis to get to the final position
				newPos.applyAxisAngle(x_ax, j_rad);

				this.vertices.push(newPos);
			}
		}

		this.verticesNeedUpdate = true;
	}

	this.initGeometry();
	this.updateGeometry();
}

CustomTorusGeometry.prototype = Object.create( Geometry.prototype );
CustomTorusGeometry.prototype.constructor = CustomTorusGeometry;

export { CustomTorusGeometry };
