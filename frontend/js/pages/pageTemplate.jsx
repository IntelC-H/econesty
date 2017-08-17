import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'app/components/searchfield';
import { Form } from 'app/components/forms';
import { Menu, MenuHeading, MenuList, MenuItem } from 'app/components/elements';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

const PageTemplate = props =>
  <div>
    <Menu horizontal fixed className="header raised-v">
      <MenuHeading>
        <Link href="/" className="light-text">Econesty</Link>
      </MenuHeading>
      <MenuList>
        <MenuItem>
          <Form aligned>
            <SearchField
              standalone
              api={API.user}
              component={props => props.object.username}
            />
          </Form>
        </MenuItem>
        <MenuItem><Link href="/user/me" className="light-text"><span className="fa fa-user-circle-o header-icon" aria-hidden="true"></span></Link></MenuItem>
      </MenuList>
    </Menu>
    <div className="content margined">
      {props.children}
    </div>
  </div>
;

export default PageTemplate;