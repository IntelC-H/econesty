import { h, cloneElement, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { prependFunc } from './utilities';

class Responsive extends Component {
  constructor(props) {
    super(props);
    this.state = this.widthToSizes(window.innerWidth);
    this.onResize = this.onResize.bind(this);
  }

  widthToSizes(w) {
    return {
      sm: w >= 568,
      md: w >= 768,
      lg: w >= 1024,
      xl: w >= 1280
    };
  }

  componentWillMount() {
    window.addEventListener("resize", this.onResize);
  }

  componentDidUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  onResize() {
    this.setState(st => ({ ...st,
                           ...this.widthToSizes(window.innerWidth)}));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.children !== this.props.children
        || nextState.sm !== this.state.sm
        || nextState.md !== this.state.md
        || nextState.lg !== this.state.lg
        || nextState.xl !== this.state.xl;
  }

  render({ children, ...props }) {
    prependFunc(props, "onResize", this.onResize);
    return (
      <div key="responsive_wrapper" {...props}>
        {children.map(c => typeof c === "function" ? c(this.state) : cloneElement(c, this.state) )}
      </div>
    );
  }
}

export { Responsive };
export default Responsive;
