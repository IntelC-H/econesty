import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { noSelect } from '../style/mixins';

function SVGIcon({ path, style, viewBox, ...props }) {
  return (
    <svg {...props} viewBox={viewBox} style={{ ...noSelect(), pointerEvents: "none", width: "1em", height: "1em", ...style }}>
      <path style={{ fill: "currentColor" }} d={path} />
    </svg>
  );
}

SVGIcon.propTypes = {
  path: PropTypes.string.isRequired,
  viewBox: PropTypes.string.isRequired
};

export { SVGIcon };
export default SVGIcon;
