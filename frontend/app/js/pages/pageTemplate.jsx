import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Header, API, SearchField, UserRow } from 'base/base';

function PageTemplate/*Unwrapped*/(props) {
  console.log("PROPS", props);
  return (
    <div>
      <Header title="Econe$ty"
              menuElements={API.isAuthenticated ? [
                <SearchField
                  standalone
                  api={API.user}
                  placeholder="Search users"
                  component={UserRow}
                />
              ] : []}/>
      <Flex margin {...props} />
    </div>
  );
}

//const PageTemplate = API.wrapComponent(PageTemplateUnwrapped);

export default PageTemplate;
