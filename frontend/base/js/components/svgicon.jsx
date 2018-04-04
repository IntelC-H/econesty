import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Anchor } from './anchor';
import BaseStyles from '../style';

function SVGIcon({ path, viewBox }) {
  return (
    <svg viewBox={viewBox} style={{ width: "1em", height: "1em" }}>
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
