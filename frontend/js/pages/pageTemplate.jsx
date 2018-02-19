import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'app/components/searchfield';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

const PageTemplate = props =>
  <div>
    <div className="header">
      <Link href="/" className="heading light-text">Econe$ty</Link>
      <ul className="menu-list">
        <li>
          <SearchField
            standalone
            api={API.user}
            placeholder="search users"
            component={props => props.element.username}
          />
        </li>
      </ul>
  </div>
    <div className="content">
      {props.children}
    </div>
  </div>
;

export default PageTemplate;
