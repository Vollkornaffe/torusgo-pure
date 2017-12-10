import React from 'react';
import * as THREE from 'three';
import autoBind from 'react-autobind';

import Torus from '../components/Torus';

/**
 * "container" component, does not hold view code,
 * but functionality to alter the mesh, add stones etc
 */
export default class TorusContainer extends React.Component {

	constructor() {

		super();

		// Initial scene state
		this.state = {
			cameraPosition: new THREE.Vector3( 0, 5, 0),
			lookAt: new THREE.Vector3( 0, 0, 0)
		};

		autoBind(this, 'requestAnimationLoop', 'cancelAnimationLoop', 'animationLoop' );

	}

	componentDidMount() {

		// Track if we're mounted so game loop doesn't tick after unmount
		this.mounted = true;

		// Expose the global THREE object for use in debugging console
		window.THREE = THREE;

		// TODO: create the initial geometry of the Torus
		this.setState({ ...this.state, geometry: new THREE.BoxGeometry( 1, 1, 1) });

		// Start the game loop when this component loads
		this.requestAnimationLoop();

	}


	componentWillUnmount() {

		this.mounted = false;
		this.cancelAnimationLoop();

	}


	requestAnimationLoop() {

		this.reqAnimId = window.requestAnimationFrame( this.animationLoop );

	}

	cancelAnimationLoop() {

		window.cancelAnimationFrame( this.reqAnimId );

	}

	// Our game loop, which is managed as the window's requestAnimationFrame
	// callback
	animationLoop(time ) {

		if( !this.mounted ) {
			return;
		}

		this.requestAnimationLoop();

		const oldState = this.state;

		// TODO: update the state, e.g. new rotation, torus twist
		const newState = oldState;

		this.setState( newState );

	}

	render() {

		const width = window.innerWidth;
		const height = window.innerHeight;

		const {
			cameraPosition, geometry, lookAt,
		} = this.state;

		// Pass the data <Game /> needs to render. Note we don't show the game
		// until the geometry is generated
		return <div>
			{ geometry ? <Torus
				width={ width }
				height={ height }
				cameraPosition={ cameraPosition }
				lookAt={ lookAt }
				geometry={ geometry }
			/> : 'Loading' }
		</div>;

	}
}
