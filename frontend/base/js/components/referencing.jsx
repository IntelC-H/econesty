import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { prependFunc } from './utilities';

// Generic Component designed to be subclassed!
// Provides a mechanism for referencing children with basic
// testing through shouldReference
class Referencing extends Component {
  constructor(props) {
    super(props);
    this.recursiveRef = this.recursiveRef.bind(this);
    this.reference = this.reference.bind(this);
    this.shouldReference = this.shouldReference.bind(this);
    this.refreshReferences();
  }

  shouldReference(cmp) { // eslint-disable-line no-unused-vars
    return true;
  }

  // TODO: how to handle null refs (that signify the non-existence of an element)?
  reference(cmp) {
    if (cmp && this.shouldReference(cmp)) {
      this.refs.push(cmp);
    }
  }

  /*
   * recursiveRef(c)
   * Prepend a call to setRef on the ref prop of all descendants of a {VNode} c.
   *  @param {VNode} c  A (JSX) Node whose ref will be modified.
1   */
  recursiveRef(c) {
    if (c && c instanceof Object) {
      c.attributes = c.attributes || {};
      prependFunc(c.attributes, "ref", this.reference);
      if (c.children) c.children.forEach(this.recursiveRef);
    }
    return c;
  }

  refreshReferences(children = this.props.children) {
    this.refs = [];
    children.forEach(this.recursiveRef);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.refreshReferences(nextProps.children);
    }
  }
}

export { Referencing };
export default Referencing;
