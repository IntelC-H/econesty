import { h, cloneElement, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { prependFunc } from './utilities';

class Responsive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.outerWidth
    };
    this.onResize = this.onResize.bind(this);
  }

  componentWillMount() {
    window.addEventListener("resize", this.onResize);
  }

  componentDidUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  onResize(event) {
    this.setState(st => ({ ...st, width: event.target.outerWidth }));
  }

  getSizingProps() {
    return {
      sm: this.state.width >= 568,
      md: this.state.width >= 768,
      lg: this.state.width >= 1024,
      xl: this.state.width >= 1280
    };
  }

  render({ children, ...props }) {
    prependFunc(props, "onResize", this.onResize);
    return (
      <div {...props}>
        {children.map(c => {
          return typeof c === "function" ? c(this.getSizingProps()) : cloneElement(c, this.getSizingProps());
        })}
      </div>
    );
  }
}

export { Responsive };
export default Responsive;
