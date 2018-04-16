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

  get refs() {
    return Object.values(this.refMap);
  }

  shouldReference(cmp) { // eslint-disable-line no-unused-vars
    return true;
  }

  // TODO: how to handle null refs (that signify the non-existence of an element)?
  reference(refid, cmp) {
    console.log("reference()", refid, cmp);
    if (cmp && this.shouldReference(cmp)) {
      this.refMap[refid] = cmp;
    } else if (cmp && cmp._component && this.shouldReference(cmp._component)) {
      this.refMap[refid] = cmp._component;
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
      let curRefID = this.refId++;
      prependFunc(c.attributes, "ref", x => this.reference(curRefID, x));
      if (c.children) c.children.forEach(this.recursiveRef);
    }
    return c;
  }

  refreshReferences(children = this.props.children) {
    this.refId = 1;
    this.refMap = {};
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
