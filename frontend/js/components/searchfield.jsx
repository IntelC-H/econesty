import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { APICollection } from 'app/api';
import { Input, FormElement } from './forms';
import { Table } from './elements';
import { CollectionView } from './api';
import { makeClassName } from './utilities';
import { Link } from './routing';
import { DeleteButton, SearchIcon } from './elements';

function SearchFieldRow({ collectionView, searchField, element }) {
  let component = searchField.getLinkComponent();
  let linkBodyProps = { element: element };
  if (searchField.isStandalone()) {
    return (
      <tr>
        <td>
          <Link
            href={collectionView.getCollection().baseURL + element.id}
            onMouseDown={e => e.preventDefault() }
            onMouseUp={e => {
              let onClick = searchField.getClickAction();
              if (onClick) onClick(e);
              searchField.reset();
              searchField.blur();
            }}>
            {h(component, linkBodyProps)}
          </Link>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td>
        <a onMouseDown={e => e.preventDefault()}
           onMouseUp={() => searchField.setFormValue(element)}>
          {h(component, linkBodyProps)}
        </a>
      </td>
    </tr>
  );
}

function SearchResultsView({ searchField, collectionView }) {
  let elements = collectionView.getElements();
  return (
    <Table striped horizontal>
      <tbody>
        {elements.map(e => <SearchFieldRow
                             collectionView={collectionView}
                             searchField={searchField}
                             element={e} />)}
      </tbody>
    </Table>
  );
}

class SearchField extends FormElement {
  constructor(props) {
    super(props);
    this.inputNode = null; // a ref
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
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
    return false;
  }

  reset() {
    this.search = null;
    this.value = undefined;
  }

  setFormValue(v) {
    this.setState(st => ({ ...st, search: null, value: v }));
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
    if (super.shouldComponentUpdate(nextProps, nextState)) return true;
    if (this.props.search !== nextProps.search) return true;
    if (this.state.search !== nextState.search) return true;
    if (this.state.focused !== nextState.focused) return true;
    return false;
  }

  render({ value, standalone, // eslint-disable-line no-unused-vars
           api, component, className, ...props }, { focused, search }) {
    return (
      <div className={makeClassName("searchfield", className)}>
        { this.showsObject && <DeleteButton onClick={this.reset} />}
        { this.showsObject &&
          <Link href={api.baseURL + this.value.id}>
            {h(component, { element: this.value })}
          </Link>
        }
        { !this.showsObject && <SearchIcon /> }
        { !this.showsObject &&
          <Input
            {...props}
            text ignore
            ref={x => this.inputNode = x}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInput={this.onSearchChange}
          />
        }
        { !this.showsObject && focused &&
          <CollectionView
            collection={api}
            search={search}
            showsControls={false}
            className="searchfield-dropdown">
            <SearchResultsView searchField={this} />
          </CollectionView>
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

export default SearchField;
