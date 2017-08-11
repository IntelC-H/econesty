import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { asyncCollection, asyncWithProps } from './higher';
import { APICollection } from 'app/api';
import { Input, ControlGroup, makeClassName } from 'app/pure';
import { Link } from 'app/routing';

const propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  standalone: PropTypes.bool,
  object: PropTypes.object
};

const defaultProps = {
  search: "",
  standalone: true,
  object: null
};

// TODO: fix everything being shifted to the left in form mode, and BG everywhere (it's transparent)
const SearchField = asyncWithProps(props => {
  const { search, api, setState, component, name, standalone, object, className, ...filteredProps } = props;

  const FormLink = ps => <a onClick={() => setState(st => ({...st, object: ps.object, search: null}))}>{h(component, ps)}</a>;
  const NonFormLink = ps => <Link href={api.baseURL + ps.object.id}>{h(component, ps)}</Link>;
  const SearchFieldDropdownCollection = asyncCollection(
    ps => <tr><th>Showing {ps.object.results.length} of {ps.object.count}</th></tr>,
    ps => <tr><td>{h(standalone ? NonFormLink : FormLink, ps)}</td></tr>,
    page => api.list(page, search),
    false
  );

  const hasSearch = search && search.length > 0;

  return (
    <div className={makeClassName("searchfield", "inline", className)}>
      { !standalone && <Input hidden name={name} value={object} onSet={v => {
        console.log("onSet hidden", name, v);
        setState(st => ({...st, object: v}));
      }} />}
      { !!object && !standalone && <a onClick={() => setState(st => ({...st, object: null}))} className="searchfield-cancel-button inline fa fa-ban"/>}
      { !!object && !standalone && <span> <Link className="inline" href={api.baseURL + object.id} target="_blank">{h(component, { object: object })}</Link></span>}
      { (!object || standalone) &&
        <div className="inline">
          <Input
            ignore
            text
            placeholder="search..."
            onSet={v => {
              console.log("onSet", name, v);
              setState(st => ({ ...st, search: v }));
            }}
            value={search}
            {...filteredProps}
          />
          {!hasSearch && <span className="fa fa-search search-icon"/>}
          {hasSearch && standalone && <div className="searchfield-dropdown-clickshield" onClick={() => setState({search: null})}/>}
          {hasSearch && standalone && <SearchFieldDropdownCollection className="searchfield-dropdown raised-v fixed" />}
          {hasSearch && !standalone && <ControlGroup><SearchFieldDropdownCollection className="searchfield-dropdown raised-v fixed" /></ControlGroup>}
        </div>
      }
    </div>
  );
});

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;
