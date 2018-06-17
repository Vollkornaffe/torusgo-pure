import * as React from 'react';

export interface IProps {
  x: number,
  y: number,
  width: number,
  height: number,
}

const View: React.SFC<IProps> = ({x, y, width, height, children}) => (
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