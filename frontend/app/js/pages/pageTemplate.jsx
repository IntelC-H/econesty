import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'base/components/searchfield';
import UserRow from 'base/components/searchfielduserrow';
import { API } from 'base/api';
import { Header } from 'base/components/header';
import { makeClassName } from 'base/components/utilities';

function PageTemplate({ className, ...props}) {
  return (
    <div>
      <Header title="Econe$ty"
              menuElements={[
                <SearchField
                  standalone
                  api={API.user}
                  placeholder="Search users"
                  component={UserRow}
                />
              ]}/>
      <div className={makeClassName("content", className)} {...props} />
    </div>
  );
}

export default PageTemplate;
