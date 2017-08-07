import { h } from 'preact'; // eslint-disable-line no-unused-vars
import linkState from 'linkstate';
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Form, Element } from 'app/pure';

const propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string
};

const defaultProps = {
  search: ""
};

const SearchIcon = <span className="fa fa-search search-icon"/>;

const SearchField = asyncWithProps(props => {
  const { search, api, setState, component } = props;

  let jsx = null;
  if (search.length === 0) {
    jsx = SearchIcon;
  } else {
    const SearchFieldDropdownCollection = asyncCollection(
      ps => <tr><th>Showing {ps.object.results.length} of {ps.object.count}</th></tr>,
      component,
      page => api.list(page, search),
      false
    )
    jsx = <div>
      <div className="searchfield-dropdown-clickshield" onClick={e => setState({search: ""})}/>
      <SearchFieldDropdownCollection className="searchfield-dropdown raised-v" />
    </div>;
  }

  return (
    <div className="searchfield">
      <Form aligned>
        <Element
          text
          name="search"
          placeholder={"Search " + api.resource + "s"}
          onInput={linkState(props, 'search', 'target.value')}
          value={search}
        />
      </Form>
      {jsx}
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
