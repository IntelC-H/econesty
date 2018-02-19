import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'app/components/searchfield';
import { MenuList, MenuItem } from 'app/components/elements';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

const PageTemplate = props =>
  <div>
    <div className="header">
      <Link href="/" className="heading light-text">Econe$ty</Link>

      <MenuList>
        <MenuItem>
          <SearchField
            standalone
            api={API.user}
            placeholder="search users"
            component={props => props.element.username}
          />
        </MenuItem>
      </MenuList>
  </div>
    <div className="content">
      {props.children}
    </div>
  </div>
;

export default PageTemplate;
