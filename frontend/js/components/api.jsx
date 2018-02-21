import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Button, Grid, GridUnit, Loading } from 'app/components/elements';
import { makeClassName } from 'app/components/utilities';

// TODO: errors & error recovery
class CollectionView extends Component {
  /*
    Props:
    search: A string by which to limit results
    collection: the API collection to show a view for
    empty: Something to render in the absence of elements
    children: a representation of the collection. Rendered w/ the prop
              `collectionView` which refers to the the enclosing CollectionView.
  */

  constructor(props) {
    super(props);
    this.reloadData = this.reloadData.bind(this);
    this.setPage = this.setPage.bind(this);
    this.gotoNextPage = this.gotoNextPage.bind(this);
    this.gotoPreviousPage = this.gotoPreviousPage.bind(this);
    this.createElement = this.createElement.bind(this);
    this.updateElement = this.updateElement.bind(this);
    this.saveElement = this.saveElement.bind(this);
    this.getElements = this.getElements.bind(this);
    this.state = {
      search: props.search, // the current search string
      collection: props.collection, // the collection to load elements from
      page: 1, // the current page
      count: 0, // the number of elements in the whole collection
      nextPage: null, // the next page number or null if no next page
      previousPage: null, // the previous page number or null if no previous page
      elements: [], // elements in the current page
      loading: true // whether or not the collection is loading
    };
  }

  // Reloads the collection's current page from the server.
  reloadData() {
    const { collection, page, search } = this.state;
    this.setState(st => ({ ...st, loading: true }));
    collection.list(page, search).then(ps =>
      this.setState(st => ({ ...st,
                             loading: false,
                             elements: ps.results,
                             nextPage: ps.next,
                             previousPage: ps.previous,
                             count: ps.count}))
    );
  }

  saveElement(object) {
    const { id, ...xs } = object;
    if (id !== null && id !== undefined) this.updateElement(id, xs);
    else                                 this.createElement(xs);
  }

  createElement(object) {
    this.setState(st => ({ ...st, loading: true, page: 1 }));
    this.state.collection.create(object)
                         .then(this.reloadData);
  }

  updateElement(id, object) {
    this.setState(st => ({ ...st, loading: true }));
    this.state.collection.update(id, object)
                         .then(this.reloadData);
  }

  deleteElement(id, soft = false) {
    this.setState(st => ({ ...st, loading: true }));
    this.state.collection.delete(id, soft)
                         .then(this.reloadData);
  }

  getElements() {
    return this.state.elements;
  }

  getCollection() {
    return this.props.collection;
  }

  setPage(page) {
    this.setState(st => ({ ...st, page: page }), this.reloadData);
  }

  gotoPreviousPage() {
    this.setPage(this.state.previousPage);
  }

  gotoNextPage() {
    this.setPage(this.state.nextPage);
  }

  componentWillMount() {
    this.reloadData();
  }

  componentWillReceiveProps(nextProps) {
    let newSearch = nextProps.search !== this.state.search;
    let newCollection = nextProps.collection !== this.state.collection;
    if (newSearch || newCollection) {
      this.setState((st, props) => ({
        ...st,
        search: (newSearch ? nextProps : props).search,
        collection: (newCollection ? nextProps : props).collection
      }), this.reloadData);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { count, elements, loading } = this.state;
    if (nextState.loading !== loading) return true;
    if (nextState.count !== count) return true;
    if (nextState.elements !== elements) return true;
    if (nextProps.empty !== this.props.empty) return true;
    if (nextProps.showsControls !== this.props.showsControls) return true;
    if (nextProps.children !== this.props.children) return true;
    return false;
  }

  render({ className, children, showsControls, empty,
           collection, search, // eslint-disable-line no-unused-vars
           ...props},
         { loading, page, count, nextPage, previousPage }) {
    let newClassName = makeClassName("collection", className);

    if (loading) return <div {...props} className={newClassName}><Loading /></div>;

    let childPropsDiff = { collectionView: this };

    return (
      <div {...props} className={newClassName}>
	{children.map(c => cloneElement(c, childPropsDiff))}
        {count === 0 && empty}
        {showsControls && count > 0 &&
        <Grid className="collection-controls">
          <GridUnit className="center collection-control" size="1-3">
            <Button disabled={previousPage === null}
                    onClick={this.gotoPreviousPage}
                    >❮</Button>
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            <div className="collection-page-indicator">
              <span>{page} of {Math.ceil(count/10) || 1}</span>
            </div>
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            <Button disabled={nextPage === null}
                    onClick={this.gotoNextPage}
                    >❯</Button>
          </GridUnit>
        </Grid>}
      </div>
    );
  }
}

CollectionView.propTypes = {
  empty: PropTypes.node,
  showsControls: PropTypes.bool,
  search: PropTypes.string,
  collection: PropTypes.object.isRequired
};
CollectionView.defaultProps = {
  empty: null,
  showsControls: true,
  search: null
};

// Create elements in REST collections. Must be a direct child
// of a CollectionView.
class CollectionCreation extends Component {
  /*
    Props:
    createText: text to be displayed on the button that "opens" the creation
                form, as represented by `children`.
    cancelText: text to be displayed on the button that "closes" the creation
                form, as represented by `children`.
    children: JSX which should implement element creation for a collection.
              Rendered w/ the prop `collectionView` which refers to the the
              enclosing CollectionView.
  */
  constructor(props) {
    super(props);
    this.setVisible = this.setVisible.bind(this);
    this.state = { visible: false };
  }

  setVisible(visible) {
    this.setState({ visible: visible });
  }

  render({ children, collectionView, createText, cancelText }) {
    if (this.state.visible) {
      if (children.length === 0) return null;

      let childProps = {
        collectionView: collectionView,
        CancelButton: () => <Button onClick={() => this.setVisible(false)}>{cancelText}</Button>
      };

      return (
        <div>
          {children.map(c => cloneElement(c, childProps))}
        </div>
      );
    }
    return <Button onClick={() => this.setVisible(true)}>{createText}</Button>;
  }
}

CollectionCreation.propTypes = {
  cancelText: PropTypes.string,
  createText: PropTypes.string
};
CollectionCreation.defaultProps = {
  cancelText: "Cancel",
  createText: "+ New"
};

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
      loading: true,
      element: null
    };
  }

  getElement() {
    return this.state.element;
  }

  reloadData() {
    this.setState({ element: null, loading: true });
    this.props.collection.read(this.props.elementID)
                         .then(element => this.setState({
      element: element,
      loading: false
    }));
  }

  updateElement(obj) {
    this.setState({ element: null, loading: true });
    this.props.collection.save({ id: this.props.elementID, ...obj }).then(newObj =>
      this.setState({
        element: newObj,
        loading: false
      })
    );
  }

  componentDidUpdate({ collection, elementID },
                       prevState) { // eslint-disable-line no-unused-vars
    if (collection !== this.props.collection ||
        elementID !== this.props.elementID) {
      this.reloadData();
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
    if (loading) return <Loading />;
    return (
      <div {...props}>
        {children.map(c => cloneElement(c, { elementView: this }))}
      </div>
    );
  }
}

ElementView.propTypes = {
  collection: PropTypes.object.isRequired,
  elementID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
ElementView.defaultProps = {};

export { CollectionView, CollectionCreation, ElementView };
export default {
  CollectionView: CollectionView,
  CollectionCreation: CollectionCreation,
  ElementView: ElementView
};
