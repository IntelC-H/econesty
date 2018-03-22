import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { APICollection } from '../api';
import { Input, FormElement } from './forms';
import { Table } from './elements';
import { CollectionView } from './collectionview';
import { makeClassName } from './utilities';
import { Link, Router } from './routing';
import { DeleteButton, SearchIcon } from './elements';

function SearchResultsView({ searchField, collectionView }) {
  let elements = collectionView.getElements();
  return (
    <Table striped selectable>
      <tbody>
        {elements.length === 0 &&
          <tr>
            <td className="searchfield-noresults">
              No Results
            </td>
          </tr>}
        {elements.length > 0 && elements.map(element =>
          <tr onMouseDown={e => e.preventDefault()}
              onMouseUp={e => {
                let onClick = searchField.getClickAction();
                if (onClick) onClick(e);
                searchField.selectElement(element);
                if (searchField.isStandalone()) {
                  searchField.reset();
                  searchField.blur();
                }
              }}>
            <td>
              {h(searchField.getLinkComponent(), { element: element })}
            </td>
          </tr>)}
      </tbody>
    </Table>
  );
}

class SearchField extends FormElement {
  constructor(props) {
    super(props);
    this.inputNode = null; // a ref
    this.collectionView = null; // a ref
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.state = {
      ...this.state,
      search: this.props.search,
      focused: false
    };
  }

  blur() {
    if (this.inputNode) this.inputNode.base.blur();
  }

  focus() {
    if (this.inputNode) this.inputNode.base.focus();
  }

  get showsObject() {
    return Boolean(this.value) && !this.props.standalone;
  }

  onSearchChange(e) {
    this.setState(st => ({ ...st, search: e.target.value }));
  }

  onFocus() {
    this.setState(st => ({ ...st, focused: true }));
  }

  onBlur() {
    this.setState(st => ({ ...st, focused: false }));
  }

  onKeyUp(e) {
    if (e.key === "Enter") {
      this.blur();
      if (this.collectionView && this.collectionView.isLoaded()) {
        let es = this.collectionView.getElements();
        if (es.length > 0) {
          this.reset();
          this.selectElement(es[0]);
        }
      }
    }
  }

  reset() {
    this.setState(st => ({ ...st, search: null }));
    this.value = null;
  }

  selectElement(v) {
    if (this.isStandalone()) {
      Router.push(this.collectionView.getCollection().baseURL + v.id);
    } else {
      this.setState(st => ({ ...st, search: null, value: v }));
    }
  }

  isStandalone() {
    return this.props.standalone;
  }

  getLinkComponent() {
    return this.props.component;
  }

  getClickAction() {
    return this.props.onClick;
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    if (this.props.search !== nextProps.search) {
      this.setState(st => ({ ...st, search: nextProps.search }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
        || this.state.search !== nextState.search
        || this.state.focused !== nextState.focused;
  }

  render({ value, standalone, // eslint-disable-line no-unused-vars
           api, component, className, ...props }, { focused, search }) {
    return (
      <div className={makeClassName("searchfield", className)}>
        { this.showsObject && <DeleteButton onClick={this.reset} /> }
        { this.showsObject &&
          <Link href={api.baseURL + this.value.id}
                className="searchfield-value-link">
            {h(component, { element: this.value })}
          </Link>
        }
        { !this.showsObject && <SearchIcon /> }
        { !this.showsObject &&
          <Input
            {...props}
            text ignore
            value={focused ? search : null}
            ref={n => this.inputNode = n}
            onKeyUp={this.onKeyUp}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInput={this.onSearchChange}
          />
        }
        { !this.showsObject && focused &&
          <div className="searchfield-dropdown-container">
            <CollectionView
              ref={n => this.collectionView = n}
              collection={api}
              search={search}
              showsControls={false}
              className="searchfield-dropdown">
              <SearchResultsView searchField={this} />
            </CollectionView>
          </div>
        }
      </div>
    );
  }
}

SearchField.propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  standalone: PropTypes.bool,
  onClick: PropTypes.func
};

SearchField.defaultProps = {
  search: null,
  standalone: false,
  placeholder: "search...",
  onClick: () => undefined
};

export { SearchField };
export default SearchField;
