import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Loading } from './elements';
import { FadeTransition } from './fadetransition';

// Loads a specific element in a collection.
class ElementView extends Component {
  /*
    Props:
    collection: the API collection to load an element from
    elementID: the id of the element in the collection to load
    children: a representation of the page. Rendered w/ the prop `elementView`
              which refers to the the enclosing ElementView.
  */
  constructor(props) {
    super(props);
    this.reloadData = this.reloadData.bind(this);
    this.updateElement = this.updateElement.bind(this);
    this.state = {
      collection: props.collection,
      elementID: props.elementID,
      loading: true,
      element: null
    };
  }

  getElement() {
    return this.state.element;
  }

  reloadData() {
    this.setState(st => ({ ...st, element: null, loading: true }));
    this.state.collection.read(this.state.elementID)
                         .then(element => this.setState(st => ({
      ...st,
      element: element,
      loading: false
    })));
  }

  updateElement(obj) {
    this.setState(st => ({ ...st, element: null, loading: true }));
    this.state.collection.save({ id: this.state.elementID, ...obj }).then(newObj =>
      this.setState(st => ({
        ...st,
        element: newObj,
        loading: false
      }))
    );
  }

  componentWillReceiveProps(nextProps) {
    let newEID = nextProps.elementID !== this.state.elementID;
    let newCollection = nextProps.collection !== this.state.collection;
    if (newEID || newCollection) {
      this.setState((st, props) => ({
        ...st,
        elementID: (newEID ? nextProps : props).elementID,
        collection: (newCollection ? nextProps : props).collection
      }), this.reloadData);
    }
  }

  componentWillMount() {
    this.reloadData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { elementID, collection, children } = this.props;
    if (nextProps.elementID !== elementID) return true;
    if (nextProps.collection.resource !== collection.resource) return true;
    if (nextProps.collection.urlParams !== collection.urlParams) return true;
    if (nextProps.children !== children) return true;
    const { element, loading } = this.state;
    if (nextState.element !== element) return true;
    if (nextState.loading !== loading) return true;
    return false;
  }

  render({ children, collection, elementID, ...props }, { loading }) {  // eslint-disable-line no-unused-vars
    return (
      <FadeTransition {...props}>
        {loading && <Loading key="loading" />}
        {!loading && <div key="content">{children.map(c => cloneElement(c, { elementView: this }))}</div>}
      </FadeTransition>
    );
  }
}

ElementView.propTypes = {
  collection: PropTypes.object.isRequired,
  elementID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
ElementView.defaultProps = {};

export { ElementView };
export default ElementView;
