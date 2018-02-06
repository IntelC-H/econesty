import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
// import { asyncCollection } from './higher';
import { APICollection } from 'app/api';
import { Input, FormGroup, FormElement } from './forms';
import { Table } from './elements';
import { CollectionView } from './api';
import { makeClassName } from './utilities';
import { Link } from './routing';

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

function SearchFieldRow({ collectionView, searchField, element }) {
  let component = searchField.getLinkComponent();
  let linkBodyProps = { element: element };
  if (searchField.isStandalone()) {
    return (
      <tr>
        <td>
          <Link
            href={collectionView.getCollection().baseURL + element.id}
            onClick={e => {
              let onClick = searchField.getClickAction();
              if (onClick) onClick(e);
              searchField.reset();
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
        <a onClick={() => searchField.setFormValue(element)}>
          {h(component, linkBodyProps)}
        </a>
      </td>
    </tr>
  );
}

const propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  standalone: PropTypes.bool,
  onClick: PropTypes.func
};

const defaultProps = {
  search: null,
  standalone: false,
  onClick: () => undefined
};

class SearchField extends FormElement {
  constructor(props) {
    super(props);
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);
    this.state = {
      value: this.props.value,
      search: this.props.search
    };
  }

  get search() {
    return this.state.search;
  }

  set search(s) {
    this.setState(st => ({ ...st, search: s }));
  }

  reset() {
    this.search = null;
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

  render(props) {
    const { search, value, // eslint-disable-line no-unused-vars
            api, component, standalone,
            className, ...filteredProps } = props;

    const hasSearch = Boolean(this.search) && this.search.length > 0;
    const showsObject = Boolean(this.value) && !standalone;

    const wrapperClassName = makeClassName("searchfield",
                                           "inline-block",
                                           "relative",
                                           className);

    return (
      <div className={wrapperClassName}>
        { showsObject &&
          <a
            onClick={this.reset}
            className="searchfield-cancel-button inline fa fa-times"/>}
        { showsObject &&
          <span>
            <Link
              className="inline"
              href={api.baseURL + this.value.id}
              target="_blank">
              {h(component, { object: this.value })}
            </Link>
          </span>}
        { !showsObject && hasSearch &&
          <div
            className="searchfield-dropdown-clickshield"
            onClick={this.reset}/>}
        { !showsObject && !hasSearch &&
          <span className="fa fa-search search-icon"/>}
        { !showsObject &&
          <FormGroup>
            <Input
              {...filteredProps}
              text ignore
              placeholder="search..."
              onInput={e => this.search = e.target.value }
              value={this.search}
            />
          </FormGroup>
        }
        { !showsObject && hasSearch &&
          <CollectionView
            collection={this.props.api}
            search={this.search}
            className="searchfield-dropdown raised-v">
            <SearchResultsView searchField={this} />
          </CollectionView>
        }
      </div>
    );
  }
}

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
