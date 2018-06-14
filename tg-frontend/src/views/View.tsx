import * as React from 'react';
import {IViewProps} from '../types';
import connectView from './ViewContainer';

const View: React.SFC<IViewProps> = ({x, y, width, height, children}) => (
  <div style={{
    position: 'relative',
    left: x,
    top: y,
    width,
    height,
  }}>
    {children}
  </div>
);

export default View;