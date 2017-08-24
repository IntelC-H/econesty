import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Input } from './forms';
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

// FIXME: dropdown shifted to the left when `standalone === false`.
const SearchField = asyncWithProps(props => {
  const { search, api, setState, component, name, standalone, object, className, onClick, ...filteredProps } = props;
  delete filteredProps.forceUpdate;
  const FormLink = ps => <a
                          onClick={() => setState(st => ({...st, object: ps.object, search: null}))}
                          >{h(component, ps)}</a>;
  const NonFormLink = ps => <Link
                              onClick={e => {
                                onClick(e);
                                setState(st => ({ ...st, search: null}));
                              }} href={api.baseURL + ps.object.id}>{h(component, ps)}</Link>;
  const SearchFieldDropdownCollection = asyncCollection(
    null,
    ps => <tr><td>{h(standalone ? NonFormLink : FormLink, ps)}</td></tr>,
    page => api.list(page, search),
    false
  );

  const hasSearch = search && search.length > 0;
  const showsObject = object && !standalone;

  if (!showsObject && hasSearch) filteredProps.className = "raised-noshadow";

  return (
    <div className={makeClassName("searchfield", "inline-block", "relative", className)}>
      { !standalone && <Input hidden name={name} value={object} onSet={v => setState(st => ({...st, object: v}))} /> }
      { showsObject && <a onClick={() => setState(st => ({...st, object: null}))} className="searchfield-cancel-button inline fa fa-times"/>}
      { showsObject && <span> <Link className="inline" href={api.baseURL + object.id} target="_blank">{h(component, { object: object })}</Link></span>}
      { !showsObject && !hasSearch && <span className="fa fa-search search-icon"/>}
      { !showsObject &&
        <Input
          ignore
          text
          placeholder="search..."
          onSet={v => setState(st => ({ ...st, search: v }))}
          value={search || ""}
          {...filteredProps}
        /> }
      { !showsObject && hasSearch && <div className="searchfield-dropdown-clickshield" onClick={() => setState({search: null})}/>}
      { !showsObject && hasSearch && <div className="searchfield-dropdown-wrapper"><SearchFieldDropdownCollection className="searchfield-dropdown raised-v" /></div>}
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
