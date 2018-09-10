import {Matrix4, Vector2, Vector3, Vector4} from "three";

// returns a tuple of camera position in object space (first)
// and ray direction in object space (second)
export default function(
  mousePos: Vector2,  // in pixels
  cameraPos: Vector3, // in worldspace
  inverseProjectionMatrix: Matrix4,
  inverseViewMatrix: Matrix4,
  inverseModelMatrix: Matrix4,
): [Vector3, Vector3] {
  // we have to compute the camera and cursor position

  // first ins normalized device coordinates
  const cursorPosOC = new Vector4(mousePos.x, mousePos.y, 1, 1);
  // to camera coordinates
  cursorPosOC.applyMatrix4(inverseProjectionMatrix);
  cursorPosOC.multiplyScalar(1/cursorPosOC.w);
  // to world coordinates
  cursorPosOC.applyMatrix4(inverseViewMatrix);
  // we already know the camera position in world coordinates
  const cameraPosOC = new Vector4(
    cameraPos.x,
    cameraPos.y,
    cameraPos.z,
    1.0);
  // to object coordinates
  cursorPosOC.applyMatrix4(inverseModelMatrix);
  cameraPosOC.applyMatrix4(inverseModelMatrix);

  return [
    new Vector3(
      cameraPosOC.x,
      cameraPosOC.y,
      cameraPosOC.z,
    ),
    new Vector3(
    cursorPosOC.x - cameraPosOC.x,
    cursorPosOC.y - cameraPosOC.x,
    cursorPosOC.z - cameraPosOC.z,
  ).normalize()];
}
