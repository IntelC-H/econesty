import { h } from 'preact'; // eslint-disable-line no-unused-vars
import linkState from 'linkstate';
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Form, Element, FakeElement, Button } from 'app/pure';
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

const SearchField = asyncWithProps(props => {
  const { search, api, setState, component, name, isFormElement, object, ...filteredProps } = props;

  const FormLink = ps => <a onClick={e => setState(st => ({...st, object: ps.object}))}>{h(component, ps)}</a>;
  const NonFormLink = ps => <Link href={api.baseURL + ps.object.id}>{h(component, ps)}</Link>;
  const SearchFieldDropdownCollection = asyncCollection(
    ps => <tr><th>Showing {ps.object.results.length} of {ps.object.count}</th></tr>,
    ps => <tr><td>{h(isFormElement ? FormLink : NonFormLink, ps)}</td></tr>,
    page => api.list(page, search),
    false
  );

  const dropdownClass = isFormElement ? "searchfield-dropdown" : "searchfield-dropdown raised-v fixed";

  return (
    <div className="searchfield">
      <Form aligned>
        {isFormElement && object !== null &&
            <Element hidden name={name} value={object.id} label="User">
              <Button
                onClick={e => setState(st => ({...st, object: null}))}
                className="fa fa-ban searchfield-cancel-button inline"
              >
              </Button>
              <Link className="inline" href={"/user/" + object.id} target="_blank">{h(component, { object: object })}</Link>
            </Element>
        }
        {(!isFormElement || object === null) && <Element
          ignore
          text
          placeholder="search..."
          onInput={e => setState(st => ({ ...st, search: e.target.value }))}
          value={search}
          {...filteredProps}
        >
          {(search.length === 0) && <span className="fa fa-search search-icon"/>}
          {search.length > 0 && !isFormElement && <div className="searchfield-dropdown-clickshield" onClick={e => setState({search: ""})}/>}
          {search.length > 0 && object === null && isFormElement && <FakeElement className="fixed" label=""><SearchFieldDropdownCollection className={dropdownClass} /></FakeElement>}
          {search.length > 0 && object === null && !isFormElement && <SearchFieldDropdownCollection className={dropdownClass} />}
        </Element>}
      </Form>
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
