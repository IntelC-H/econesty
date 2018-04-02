import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Anchor } from './anchor';
import BaseStyles from '../style';
import { parseSize, renderSize, fmapSize, reduceSizes } from '../style/sizing';

const iconDimension = renderSize(reduceSizes((a, b) => a - b,
                      [parseSize(BaseStyles.elementHeight), fmapSize(s => s * 2, parseSize(BaseStyles.padding))]));

const iconPath = "M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z";

const styles = {
  icon: {
    color: BaseStyles.deleteButton.color,
    cursor: "pointer",
    height: BaseStyles.elementHeight,
    width: BaseStyles.elementHeight,
    boxSizing: "border-box",
    padding: BaseStyles.padding
  }
};

function DeleteButton(props) {
  return (
    <Anchor {...props}>
      <svg style={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path style={{ fill: "currentColor" }} d={iconPath} />
      </svg>
    </Anchor>
  );
}

export { DeleteButton };
export default DeleteButton;
