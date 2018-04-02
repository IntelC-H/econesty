import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Anchor, Header, API, SearchField } from 'base/base';
import { UserRow } from 'app/common';
import style from 'app/style';
import palette from 'app/palette';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';

const styles = {
  header: {
    zIndex: "100",
    position: "sticky",
    height: "auto",
    top: 0,
    backgroundColor: palette.primaryColor,
    borderBottom: `${BaseStyles.border.width} solid ${palette.borderColor}`
  },
  heading: {
    lineHeight: "100%",
    textTransform: "uppercase",
    color: "#FFFFFF",
    fontFamily: "'Hammersmith One', sans-serif",
    fontSize: BaseStyles.elementHeight,
    margin: BaseStyles.padding,
    ...noSelect()
  }
};

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
      <div style={style.element.page}>
        <Flex container wrap justifyContent="space-between" alignItems="center" style={styles.header}>
          <Anchor href="/" style={styles.heading}>Econe$ty</Anchor>
          <Flex container wrap row alignItems="center" margin>
           {authenticated && <SearchField
                    standalone
                    api={API.user}
                    placeholder="Search users"
                    component={UserRow}
                  />}
          </Flex>
        </Flex>
        <Flex margin {...props} />
      </div>
    );
  }
}

export default PageTemplate;
