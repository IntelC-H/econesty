import { h } from 'preact'; // eslint-disable-line no-unused-vars
import linkState from 'linkstate';
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Form, Element, FakeElement, Button, makeClassName } from 'app/pure';
import { Link } from 'app/routing';

const propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  isFormElement: PropTypes.bool,
  object: PropTypes.object
};

const defaultProps = {
  search: "",
  isFormElement: false,
  object: null
};

// TODO: fix everything being shifted to the left in form mode, and BG everywhere (it's transparent)
const SearchField = asyncWithProps(props => {
  const { search, api, setState, component, name, isFormElement, object, className, ...filteredProps } = props;

  const FormLink = ps => <a onClick={e => setState(st => ({...st, object: ps.object, search: null}))}>{h(component, ps)}</a>;
  const NonFormLink = ps => <Link href={api.baseURL + ps.object.id}>{h(component, ps)}</Link>;
  const SearchFieldDropdownCollection = asyncCollection(
    ps => <tr><th>Showing {ps.object.results.length} of {ps.object.count}</th></tr>,
    ps => <tr><td>{h(isFormElement ? FormLink : NonFormLink, ps)}</td></tr>,
    page => api.list(page, search),
    false
  );

  const dropdownClass = isFormElement ? "searchfield-dropdown" : "searchfield-dropdown raised-v fixed";

  const searchQ = search || "";
  const searchInputField =
    <Element
      ignore
      text
      placeholder="search..."
      onInput={e => setState(st => ({ ...st, search: e.target.value }))}
      value={search}
      {...filteredProps}
    >
      {(searchQ.length === 0) && <span className="fa fa-search search-icon"/>}
      {searchQ.length > 0 && !isFormElement && <div className="searchfield-dropdown-clickshield" onClick={e => setState({search: null})}/>}
      {searchQ.length > 0 && isFormElement && <FakeElement className="fixed" label=""><SearchFieldDropdownCollection className={dropdownClass} /></FakeElement>}
      {searchQ.length > 0 && !isFormElement && <SearchFieldDropdownCollection className={dropdownClass} />}
    </Element>;
  
  if (isFormElement) {
    return (
      <div className={makeClassName("searchfield", "pure-control-group", className)}>
        <Element hidden name={name} value={object} label={ object ? "User" : ""} onSet={v => setState(st => ({...st, object: v})) }>
          { !!object && <a onClick={e => setState(st => ({...st, object: null}))} className="searchfield-cancel-button inline fa fa-ban"/>}
          { !!object && <span> <Link className="inline" href={"/user/" + object.id} target="_blank">{h(component, { object: object })}</Link></span>}
          { !object && searchInputField }
        </Element>
      </div>
    );
  }
  return (
    <div className={makeClassName("searchfield", className)}>
      <Form aligned>
        {searchInputField}
      </Form>
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
