import React from 'react';
import PropTypes from 'prop-types';
import { asyncCollection } from './higher';
import { APICollection } from 'app/api';
import { Element } from './form';

const propTypes = {
  headerComponent: PropTypes.func,
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired
};

const defaultProps = {
  headerComponent: null
};

class SearchField extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { search: "" };
  }

  handleChange(e) {
    this.setState({search: e.target.value});
  }

  render() {
    const canSearch = this.state.search.length > 0;
    const SearchFieldDropdownCollection = asyncCollection(
      this.props.headerComponent,
      this.props.component,
      page => this.props.api.list(page, this.state.search)
    )
    return (
      <div className="searchfield">
        <Element
          required text
          name="search"
          label={"Search " + this.props.api.resource + "s"}
          wrapperClass="textfield"
          onChange={this.handleChange}
          value={this.state.search}
        />
        {canSearch && <div className="searchfield-dropdown">
          <SearchFieldDropdownCollection />
        </div>}
      </div>
    );
  }
}

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;