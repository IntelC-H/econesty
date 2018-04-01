import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { APICollection } from '../api';
import Input from './form/formelements/input';
import FormElement from './form/formelement';
import { Table } from './elements';
import { CollectionView } from './collectionview';
import { makeClassName } from './utilities';
import { Router } from './routing';
import { DeleteButton } from './elements';
import { Flex } from './flex';
import { Anchor } from './anchor';

const styles = {
  searchfield: {
    position: "relative",
    width: "100%"
  },
  table: {
    border: "none"
  },
  dropdownContainer: { // A zero-height container designed to take the dropdown out of the HTML flow
    // Prevent interference with page & build new coord system
    padding: 0,
    margin: 0,
    position: "relative",
    height: 0,
    overflow: "visible",
    width: "100%"
  },
  input: {
    outlineOffset: 0,
    width: "100%"
  },
  inputFocused: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: "none",
    marginBottom: 0
  },
  dropdown: { // The dropdown in which search results are displayed
    boxSizing: "border-box",
    overflow: "hidden",
    zIndex: "100",
    position: "absolute",
    width: "100%",
    borderTop: "none"
  },
  searchIcon: {
    pointerEvents: "none",
    cursor: "default",
    position: "absolute",
    left: "auto"
  },
  valueLink: {
    margin: 0
  }
};

function SearchResultsView({ searchField, collectionView }) {
  let elements = collectionView.getElements();
  return (
    <Table striped selectable style={styles.table}>
      <tbody>
        {elements.length === 0 &&
            <Flex container alignItems="center" justifyContent="center" marginTop marginBottom>
              No Results
            </Flex>}
        {elements.length > 0 && elements.map(element =>
          <tr onMouseDown={e => e.preventDefault()}
              onMouseUp={e => {
                if (e.which !== 3) {
                  let onClick = searchField.getClickAction();
                  if (onClick) onClick(e);
                  searchField.selectElement(element);
                  if (searchField.isStandalone()) {
                    searchField.reset();
                    searchField.blur();
                  }
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
      <div className={makeClassName("searchfield", className)} style={styles.searchfield}>
        { this.showsObject &&
          <Flex container row alignItems="center">
            <Flex container alignItems="center" justifyContent="center"
                  component={Anchor}
                  href={api.baseURL + this.value.id}
                  style={styles.valueLink}
                  className="searchfield-value-link">
              {h(component, { element: this.value })}
            </Flex>
            <DeleteButton onClick={this.reset} />
          </Flex>}
        { !this.showsObject && 
         <svg className="search-icon" style={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
           <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>
         </svg>}
        { !this.showsObject &&
          <Input
            {...props}
            text ignore
            style={focused ? { ...styles.input, ...styles.inputFocused } : styles.input}
            value={focused ? search : null}
            ref={n => this.inputNode = n}
            onKeyUp={this.onKeyUp}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInput={this.onSearchChange}
          />
        }
        { !this.showsObject && focused &&
          <div style={styles.dropdownContainer}>
            <CollectionView
              ref={n => this.collectionView = n}
              collection={api}
              search={search}
              showsControls={false}
              style={styles.dropdown}
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
