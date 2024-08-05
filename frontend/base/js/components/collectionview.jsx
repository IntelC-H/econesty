import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import Loading from './loading';
import { FadeTransition } from './fadetransition';
import Flex from './flex';

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
    this._handleError = this._handleError.bind(this);
    this.state = {
      search: props.search, // the current search string
      collection: props.collection, // the collection to load elements from
      page: 1, // the current page
      count: 0, // the number of elements in the whole collection
      nextPage: null, // the next page number or null if no next page
      previousPage: null, // the previous page number or null if no previous page
      elements: [], // elements in the current page
      loading: true, // whether or not the collection is loading
      error: null // potential error
    };
  }

  // Reloads the collection's current page from the server.
  reloadData() {
    const { collection, page, search } = this.state;
    this.setState(st => ({ ...st, loading: true }));
    collection.list(page, search).catch(this._handleError).then(res => this.setState(st => this._updateStateFromAPI(res, st)));
  }

  // TODO: Error Handling!!!
  _handleError(err) {
    this.setState(st => ({ ...st, error: err, loading: false, elements: [], nextPage: null, previousPage: null, count: 0 }));
  }

  _updateStateFromAPI(res, st) {
    if (Array.isArray(res)) {
      return {...st, loading: false, elements: res, nextPage: null, previousPage: null, count: res.count };
    }

    return { ...st, loading: false, elements: res.results, nextPage: res.next, previousPage: res.previous, count: res.count };
  }

  saveElement(object) {
    const { id, ...xs } = object;
    if (id !== null && id !== undefined) this.updateElement(id, xs);
    else                                 this.createElement(xs);
  }

  createElement(object) {
    this.setState(st => ({ ...st, loading: true, page: 1 }));
    this.getCollection().create(object)
                        .catch(this._handleError)
                        .then(this.reloadData);
  }

  updateElement(id, object) {
    this.setState(st => ({ ...st, loading: true }));
    this.getCollection().update(id, object)
                        .catch(this._handleError)
                        .then(this.reloadData);
  }

  deleteElement(id, soft = false) {
    this.setState(st => ({ ...st, loading: true }));
    this.getCollection().delete(id, soft)
                        .catch(this._handleError)
                        .then(this.reloadData);
  }

  listMethod(httpMethod, method, body = null, urlparams = {}) {
    this.getCollection().classMethod(httpMethod, method, body, urlparams)
                        .catch(this._handleError).then(this.reloadData);
  }

  instanceMethod(httpmeth, method, id, body = null, urlparams = {}) {
    this.getCollection().instanceMethod(httpmeth, method, id, body, urlparams)
                        .catch(this._handleError).then(this.reloadData);
  }

  isLoaded() {
    return !this.state.loading;
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
    if (nextProps.showsControls !== this.props.showsControls) return true;
    if (nextProps.children !== this.props.children) return true;
    return false;
  }

  render({ children, showsControls, loadingDelay,
           collection, search, // eslint-disable-line no-unused-vars
           ...props},
         { loading, page, count, nextPage, previousPage }) {
    return (
      <FadeTransition {...props}>
        {loading && <Loading fadeOut fadeIn key="loading" delay={loadingDelay} />}
	{!loading && <div fadeIn key="content" className="collection-content">
                       {children.filter(Boolean).map(c =>
                         c instanceof Function ? c(this) : cloneElement(c, { collectionView: this }))}
                     </div>}
        {!loading && showsControls && count > 0 &&
        <Flex fadeIn key="controls" container row justifyContent="space-around" alignItems="center">
          <button disabled={previousPage === null}
                  onClick={this.gotoPreviousPage}
                  ><i className="fas fa-arrow-left" /></button>
          <span className="no-select">{page} of {Math.ceil(count/10) || 1}</span>
          <button disabled={nextPage === null}
                  onClick={this.gotoNextPage}
                  ><i className="fas fa-arrow-right" /></button>
        </Flex>}
      </FadeTransition>
    );
  }
}

CollectionView.propTypes = {
  showsControls: PropTypes.bool,
  search: PropTypes.string,
  collection: PropTypes.object.isRequired,
  loadingDelay: PropTypes.bool
};
CollectionView.defaultProps = {
  showsControls: true,
  search: null
};

export { CollectionView };
export default CollectionView;
