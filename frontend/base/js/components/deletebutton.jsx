import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Anchor } from './anchor';
import { Flex } from './flex';
import BaseStyles from '../style';
import SVGIcon from './svgicon';
import { parseSize, renderSize, fmapSize, reduceSizes } from '../style/sizing';

const iconDimension = renderSize(reduceSizes((a, b) => a - b,
                      [parseSize(BaseStyles.elementHeight), fmapSize(s => s * 2, parseSize(BaseStyles.padding))]));

const iconViewBox = "0 0 384 512";
const iconPath = "M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z";

const height = renderSize(reduceSizes((acc, x) => acc - x, [parseSize(BaseStyles.elementHeight), parseSize(BaseStyles.padding)]));
const styles = {
  anchor: {
    //padding: BaseStyles.padding,
    height: BaseStyles.elementHeight,
    width: BaseStyles.elementHeight,
    boxSizing: "border-box",
    color: BaseStyles.deleteButton.color
  }
};

function DeleteButton({ style, ... props }) {
  return (
    <Flex component={Anchor} container justifyContent="center" alignItems="center" style={{ ...style, ...styles.anchor }} {...props}>
      <SVGIcon viewBox={iconViewBox} path={iconPath} />
    </Flex>
  );
}

export { DeleteButton };
export default DeleteButton;
