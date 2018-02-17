import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Button, Grid, GridUnit, Loading } from 'app/components/elements';

// TODO: errors & error recovery
class CollectionView extends Component {
  /*
    Props:
    search: A string by which to limit results
    collection: the API collection to show a view for
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
      page: 1, // the current page
      count: 0, // the number of elements in the whole collection
      nextPage: null, // the next page number or null if no next page
      previousPage: null, // the previous page number or null if no previous page
      elements: [], // elements in the current page
      loading: true // whether or not the collection is loading
    };
  }

  // Reloads the collection's current page from the server.
  reloadData(page = this.state.page, search = this.props.search) {
    this.setState(st => ({ ...st, loading: true }));
    this.props.collection.list(page, search).then(ps =>
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
    this.props.collection.create(object)
                         .then(this.reloadData);
  }

  updateElement(id, object) {
    this.setState(st => ({ ...st, loading: true }));
    this.props.collection.update(id, object)
                         .then(this.reloadData);
  }

  deleteElement(id, soft = false) {
    this.setState(st => ({ ...st, loading: true }));
    this.props.collection.delete(id, soft)
                         .then(this.reloadData);
  }

  getElements() {
    return this.state.elements;
  }

  getCollection() {
    return this.props.collection;
  }

  setPage(page) {
    this.setState(st => ({ ...st, page: page }), () => this.reloadData());
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
    let shouldReload = false;
    if (nextProps.search !== this.props.search) shouldReload = true;
    if (nextProps.collection !== this.props.collection) shouldReload = true;
    if (shouldReload) this.reloadData(this.state.page, nextProps.search);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { search, collection, children } = this.props;
    if (nextProps.search !== search) return true;
    if (nextProps.collection.resource !== collection.resource) return true;
    if (nextProps.collection.urlParams !== collection.urlParams) return true;
    if (nextProps.children !== children) return true;
    const { page, count, elements, loading } = this.state;
    if (nextState.page !== page) return true;
    if (nextState.count !== count) return true;
    if (nextState.elements !== elements) return true;
    if (nextState.loading !== loading) return true;
    return false;
  }

  render({ className, children, ...props},
         { loading, page, count, nextPage, previousPage }) {
    if (loading) return <Loading className={(className || "") + " collection"} />;
    let childPropsDiff = { collectionView: this };
    return (
      <div className={(className || "") + " collection"} {...props}>
	{children.map(c => cloneElement(c, childPropsDiff))}

        <Grid className="collection-controls">
          <GridUnit className="center collection-control" size="1-3">
            <Button disabled={previousPage === null}
                    className="margined raised"
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
                    className="margined raised"
                    onClick={this.gotoNextPage}
                    >❯</Button>
          </GridUnit>
        </Grid>
      </div>
    );
  }
}

CollectionView.propTypes = {
  search: PropTypes.string,
  collection: PropTypes.object.isRequired
};
CollectionView.defaultProps = {
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
      return (
        <div>
          {children.map(c => cloneElement(c, { collectionView: collectionView }))}
          <Button onClick={() => this.setVisible(false)}>{cancelText}</Button>
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
    if (collection.resource !== this.props.collection.resource ||
        collection.urlParams !== this.props.collection.urlParams ||
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
