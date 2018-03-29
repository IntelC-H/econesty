import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Flex } from './flex';

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

  render({ children, peers, label, ...props }, { open }) {
    /*if (children.length === 0) return null;
    if (open && children.length === 1) return cloneElement(children[0], { revealButton: this});
    else if (open && children.length > 1)*/ if (open) return <Flex {...props}>{children.map(c => cloneElement(c, { revealButton: this}))}</Flex>;
    return <Flex {...props}>{peers}<button onClick={this.open}>{label}</button></Flex>;
  }
}

RevealButton.propTypes = {
  label: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  peers: PropTypes.arrayOf(PropTypes.node)
};

RevealButton.defaultProps = {
  label: null,
  peers: []
};

export { RevealButton };
export default RevealButton;
