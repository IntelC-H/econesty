import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Button } from './elements';

class RevealButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    this.setState(st => ({ ...st, open: false }));
  }

  open() {
    this.setState(st => ({ ...st, open: true }));
  }

  render({ children, label, ...props }, { open }) {
    if (children.length === 0) return null;
    if (open && children.length === 1) return <div {...props}>{cloneElement(children[0], { revealButton: this})}</div>;
    else if (open && children.length > 1) return <div {...props}>{children.map(c => cloneElement(c, { revealButton: this}))}</div>;
    return <Button onClick={this.open}>{label}</Button>;
  }
}

RevealButton.propTypes = {
  label: PropTypes.oneOf([PropTypes.string, PropTypes.node])
};

RevealButton.defaultProps = {
  label: null
};

export { RevealButton };
export default RevealButton;
