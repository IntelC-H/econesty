import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Input, FormGroup, FormElement } from './forms';
import { makeClassName } from './utilities';
import { Link } from './routing';

const propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  standalone: PropTypes.bool,
  object: PropTypes.any,
  onClick: PropTypes.func
};

const defaultProps = {
  search: null,
  standalone: false,
  object: null,
  onClick: () => undefined
};

class SearchField extends FormElement {
  constructor(props) {
    super(props);
    this.formLink = this.formLink.bind(this);
    this.state = { value: this.props.value, search: this.props.search };
    this.formLink = this.formLink.bind(this);
    this.nonFormLink = this.nonFormLink.bind(this);
    this.dropdownCollection = asyncCollection(
      null,
      ps => <tr><td>{h(this.props.standalone ? this.nonFormLink : this.formLink, ps)}</td></tr>,
      pg => this.props.api.list(pg, this.props.api.search),
      false
    );
  }

  get search() { return this.state.search; }
  set search(s) { this.setState(st => ({ ...st, search: s })); }

  // Subcomponent
  formLink(props) {
    const { component } = this.props;
    return <a onClick={() => this.setState(st => ({ ...st, value: props.object, search: null }))}>{h(component, props)}</a>;
  }

  // Subcomponent
  nonFormLink(props) {
    const { onClick, component } = this.props;
    return <Link onClick={e => {
      if (onClick) onClick(e);
      this.setState(st => ({ ...st, search: null }));
    }} href={this.props.api.baseURL + props.object.id}>{h(component, props)}</Link>;
  }

  clear() {
    this.value = undefined;
  }

  clearSearch() {
    this.search = undefined;
  }

  render(props) {
    const { search, api, component, standalone, className, ...filteredProps } = props;

    const hasSearch = this.input && this.input.value && this.input.value.length > 0;
    const showsObject = this.value && !standalone;

    return (
      <div className={makeClassName("searchfield", "inline-block", "relative", className)}>
        { showsObject && <a onClick={this.clear} className="searchfield-cancel-button inline fa fa-times"/>}
        { showsObject && <span><Link className="inline"
                                     href={api.baseURL + this.value.id}
                                     target="_blank"
                               >{h(component, { object: this.value })}</Link></span>}
        { !showsObject && hasSearch && <div className="searchfield-dropdown-clickshield" onClick={this.clearSearch}/>}
        { !showsObject && !hasSearch && <span className="fa fa-search search-icon"/>}
        { !showsObject &&
          <FormGroup>
            <Input
              text ignore
              placeholder="search..."
              ref={cmp => this.input = cmp}
              {...filteredProps}
            />
          </FormGroup>
        }
      
        { !showsObject && hasSearch &&
          <div className="searchfield-dropdown-wrapper">
            <this.dropdownCollectioN className="searchfield-dropdown raised-v" />
          </div>
        }
      </div>
    );
  }
};

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
