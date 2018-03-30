import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Header, API, SearchField } from 'base/base';
import { UserRow } from 'app/common';

class PageTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: API.isAuthenticated };
    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  handleAuthChange() {
    if (this.state.authenticated !== API.isAuthenticated) {
      this.setState(st => ({ ...st, authenticated: API.isAuthenticated }));
    }
  }
  componentWillMount() {
    window.addEventListener("authchange", this.handleAuthChange);
    window.addEventListener("storage", this.handleAuthChange);
  }
  componentWillUnmount() {
    window.removeEventListener("authchange", this.handleAuthChange);
    window.removeEventListener("storage", this.handleAuthChange);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.authenticated !== this.state.authenticated || nextProps.children !== this.props.children;
  }

  render(props, { authenticated }) {
    return (
      <div>
        <Header title="Econe$ty"
                menuElements={authenticated ? [
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
}

export default PageTemplate;
