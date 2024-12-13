import { h } from 'preact'; // eslint-disable-line no-unused-vars
import SearchField from 'app/components/searchfield';
import { API } from 'app/api';
import { Header } from 'app/components/header';
import { makeClassName } from 'app/components/utilities';

function PageTemplate({ className, ...props}) {
  return (
    <div>
      <Header title="Econe$ty"
              menuElements={[
                <SearchField
                  standalone
                  api={API.user}
                  placeholder="search users"
                  component={props => props.element.username}
                />
              ]}/>
      <div className={makeClassName("content", className)} {...props} />
    </div>
  );
}

export default PageTemplate;
