import React from 'react';
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
    page => props.api.list(page, props.search)
  )
  return (
    <Form className="searchField">
      <Element
        text
        name="search"
        placeholder={"Search " + props.api.resource + "s"}
        wrapperClass="textfield"
        onChange={e => props.setAsync({search: e.target.value})}
        value={props.search}
      />
      {canSearch && <div className="searchfield-dropdown">
        <SearchFieldDropdownCollection />
      </div>}
    </Form>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;