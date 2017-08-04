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

const SearchField = asyncWithProps(props => {
  const canSearch = props.search.length > 0;
  const SearchFieldDropdownCollection = asyncCollection(
    propsp => <tr><th>Showing {propsp.object.results.length} of {propsp.object.count}</th></tr>,
    props.component,
    page => props.api.list(page, props.search),
    false
  )
  return (
    <div className="searchfield">
      <Form aligned>
        <Element
          text
          name="search"
          placeholder={"Search " + props.api.resource + "s"}
          onInput={linkState(props, 'search', 'target.value')}
          value={props.search}
        />
        {!canSearch && <span className="fa fa-search search-icon"></span>}
      </Form>
      {canSearch && <SearchFieldDropdownCollection className="searchfield-dropdown" />}
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
