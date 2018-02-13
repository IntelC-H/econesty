import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'app/components/searchfield';
import { Form } from 'app/components/forms';
import { Menu, MenuHeading, MenuList, MenuItem } from 'app/components/elements';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

const NavBar = props =>
  <Menu horizontal fixed={!props.spacer} className={props.spacer ? "header-spacer header" : "header raised-v"}>
    <MenuHeading>
      <Link href="/" className="light-text">Econe$ty</Link>
    </MenuHeading>
    <MenuList>
      <MenuItem>
        <Form aligned>
          <SearchField
            standalone
            api={API.user}
            placeholder="search users"
            component={props => props.element.username}
          />
        </Form>
      </MenuItem>
      <MenuItem><Link href="/user/me" className="light-text"><span className="fa fa-user-circle-o header-icon" aria-hidden="true"></span></Link></MenuItem>
    </MenuList>
  </Menu>
;

const PageTemplate = props =>
  <div>
    <NavBar />
    <NavBar spacer />
    <div className="content margined">
      {props.children}
    </div>
  </div>
;

export default PageTemplate;
