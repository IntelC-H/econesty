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
    this.setState = this.setState.bind(this);
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
  reloadData() {
    if (!this.state.loading) this.setState(st => ({ ...st, loading: true }));
    this.props.collection.list(this.state.page,
                               this.props.search)
                         .then(ps => {
      this.setState(st => ({ ...st,
                             loading: false,
                             elements: ps.results,
                             nextPage: ps.next,
                             previousPage: ps.previous,
                             count: ps.count}));
    });
  }

  saveElement(object) {
    const { id, ...xs } = object;
    if (id !== null && id !== undefined) this.updateElement(id, xs);
    else                                 this.createElement(xs);
  }

  createElement(object) {
    this.setState(st => ({ ...st, loading: true,
                                  page: 1 }), () => {
      this.props.collection.create(object)
                           .then(() => this.reloadData());
    });
  }

  updateElement(id, object) {
    this.setState(st => ({ ...st, loading: true }), () => {
      this.props.collection.update(id, object)
                           .then(() => this.reloadData());
    });
  }

  deleteElement(id, soft = false) {
    this.setState(st => ({ ...st, loading: true }), () => {
      this.props.collection.delete(id, soft)
                           .then(() => this.reloadData());
    });
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

  render({ className, children, ...props}, state) {
    if (state.loading) return <Loading
                                className={(className || "") + " collection"} />;

    const prevPage = this.state.previousPage;
    const nextPage = this.state.nextPage;
    return (
      <div className={(className || "") + " collection"} {...props}>
	{children.map(c => cloneElement(c, { collectionView: this }))}

        <Grid className="collection-controls">
          <GridUnit className="center collection-control" size="1-3">
            <Button key={"previous-" + prevPage}
                    disabled={prevPage === null}
                    className="margined raised"
                    onClick={this.gotoPreviousPage}
                    >{"❮"}</Button>
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            <div className="collection-page-indicator">
              <span>{this.state.page} of {Math.ceil(this.state.count/10) || 1}</span>
            </div>
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            <Button key={"next-" + nextPage}
                    disabled={nextPage === null}
                    className="margined raised"
                    onClick={this.gotoNextPage}
                    >{"❯"}</Button>
          </GridUnit>
        </Grid>
      </div>
    );
  }
}

CollectionView.propTypes = {};
CollectionView.defaultProps = {};

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
    this.setState(st => ({ ...st, loading: true }), () => {
      this.props.collection.read(this.props.elementID)
                           .then(element => {
        this.setState(st => ({
          ...st,
          element: element,
          loading: false
        }));
      });
    });
  }

  updateElement(obj) {
    const { id, ...xs } = obj; // eslint-disable-line no-unused-vars
    this.setState(st => ({ ...st, loading: true }), () => {
      this.props.collection.update(this.getElement().id, obj)
                           .then(newObj => {
        this.setState(st => ({
          ...st,
          element: newObj,
          loading: false
        }));
      });
    });
  }

  componentWillMount() {
    this.reloadData();
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

export { CollectionView, CollectionCreation, ElementView };
export default {
  CollectionView: CollectionView,
  CollectionCreation: CollectionCreation,
  ElementView: ElementView
};
