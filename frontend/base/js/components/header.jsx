import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Link } from 'base/components/routing';
import PropTypes from 'prop-types';

function Header({ menuElements, title }) {
  return (
    <div className="header">
      <Link href="/" className="heading">{title}</Link>
      <ul className="menu-list">
        {menuElements.map(me => <li>{me}</li>)}
      </ul>
    </div>
  );
}

Header.defaultProps = {
  menuElements: []
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  menuElements: PropTypes.arrayOf(PropTypes.node)
};

export { Header };
export default Header;
