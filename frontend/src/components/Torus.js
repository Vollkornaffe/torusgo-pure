import React, { PropTypes } from 'react';
import R3R from 'react-three-renderer';
import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

/**
 * Our main class to display the torus. This only contains view code!
 */
export default class Torus extends React.Component {

	static proptypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		cameraPosition: PropTypes.instanceOf( Vector3 ).isRequired,
		lookAt: PropTypes.instanceOf( Vector3 ).isRequired,
		geometry: PropTypes.instanceOf( Geometry ).isRequired
	}

	render() {

		const {
			width, height, cameraPosition, geometry, lookAt
		} = this.props;

		const {
			faces, vertices, facevertexUvs
		} = geometry;

		return <R3R
			mainCamera='camera'
			width={ width }
			height={ height }
			antialias
		>
			<resources>
				<meshPhongMaterial
					resourceId='material'
					side={ DoubleSide }
				>
				</meshPhongMaterial>
				<geometry
					resourceId='geometry'
					faces={ faces }
					vertices={ vertices }
				/>
			</resources>
			<scene>
				<perspectiveCamera
					name="camera"
					fov={ 75 }
					aspect={ width / height }
					near={ 0.1 }
					far={ 1000 }
					position={ cameraPosition }
					lookAt={ lookAt }
				/>
				<ambientLight
					color={ 0xdddddd }
				/>
				<group
					position={ new Vector3( 0, 0, 0 )}
					rotation={ new Euler( 0, 0, 0 )}
				>
					<mesh>
						<geometryResource
							resourceId='geometry'
						/>
						<materialResource
							resourceId='material'
						/>
					</mesh>
				</group>
			</scene>
		</R3R>
	}
}
