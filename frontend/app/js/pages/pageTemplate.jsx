import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Anchor, API } from 'base/base';
import { UserRow } from 'app/common';
import SearchField from 'app/components/searchfield';
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
    borderBottom: `${BaseStyles.border.width} solid ${palette.borderColor}`,
    padding: BaseStyles.padding
  },
  heading: {
    lineHeight: "100%",
    textTransform: "uppercase",
    color: "#FFFFFF",
    fontFamily: "'Hammersmith One', sans-serif",
    fontSize: BaseStyles.elementHeight,
    marginRight: BaseStyles.padding,
    ...noSelect()
  },
  copyright: {
    padding: BaseStyles.padding,
    color: "#555555",
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
      <Flex container column style={style.element.page}>
        <Flex container wrap row justifyContent="space-between" alignItems="center" style={styles.header}>
          <Anchor href="/" style={styles.heading}>Econe$ty</Anchor>
          <Flex container wrap row alignItems="center">
           {authenticated && <SearchField
                    standalone
                    api={API.user}
                    placeholder="Search users"
                    component={UserRow}
                  />}
          </Flex>
        </Flex>
        <Flex margin {...props} />
        <Flex container justifyContent="center" alignItems="flex-end" grow="1" style={styles.copyright}>© {(new Date()).getFullYear()} Nathaniel Symer</Flex>
      </Flex>
    );
  }
}

export default PageTemplate;
