import {connect}                                   from 'react-redux';
import {IState}                                    from '../types/redux';
import ThreeAnimation, {IKeyboardControls, IProps} from './ThreeAnimation';

const mapStateToProps = (state: IState): IProps => {
  const pressedKeys = state.pressedKeys;
  const controlKeys = state.controlKeys;
  const cameraDelta = state.cameraDelta;
  const twistDelta  = state.twistDelta;

  const keyboardControls: IKeyboardControls = {
    cameraDeltaX:
    +(pressedKeys.indexOf(controlKeys.up) > -1 ? cameraDelta : 0)
    - (pressedKeys.indexOf(controlKeys.down) > -1 ? cameraDelta : 0),
    cameraDeltaY:
    -(pressedKeys.indexOf(controlKeys.left) > -1 ? cameraDelta : 0)
    + (pressedKeys.indexOf(controlKeys.right) > -1 ? cameraDelta : 0),
    twistDelta:
    +(pressedKeys.indexOf(controlKeys.twistIn) > -1 ? twistDelta : 0)
    - (pressedKeys.indexOf(controlKeys.twistOut) > -1 ? twistDelta : 0),
    mouseControl: pressedKeys.indexOf(controlKeys.mouseControl) > -1,
  };

  // TOOD retrieve these from store
  const boardSizeX: number   = 21;
  const boardSizeY: number   = 21;
  const radius: number       = 1;
  const thickness: number    = 0.5;
  const stoneSize: number    = 0.05;
  const boardState: number[] = [
    1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0,
    0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1,
    0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0,
    2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0,
    0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2,
    0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0,
    3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0,
    0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3,
    0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0,
    4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0,
    0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4,
    0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0,
    5, 0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0,
    0, 0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5,
    0, 6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0,
    6, 0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0,
    0, 0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6,
    0, 7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0,
    7, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0,
    0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7,
    0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0,
    1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0,
  ];

  return {
    keyboardControls,
    boardSizeX,
    boardSizeY,
    radius,
    thickness,
    stoneSize,
    boardState,
  };
};

export default connect(mapStateToProps)(ThreeAnimation);