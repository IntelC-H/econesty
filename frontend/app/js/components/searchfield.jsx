import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { APICollection, Input, FormElement, CollectionView, Router, Button, Anchor, Flex } from 'base/base';
import { DeleteButton } from 'base/base';
import BaseStyles from 'base/style';
import { parseSize, renderSize, fmapSize, reduceSizes } from 'base/style/sizing';
import style from 'app/style';

function getStyles() {
  let searchIconDimension = renderSize(reduceSizes((a, b) => a - b, [
    parseSize(BaseStyles.elementHeight), fmapSize(s => s * 2, parseSize(BaseStyles.padding))
  ]));
  const halfBorder = renderSize(fmapSize(v => v / 2, parseSize(BaseStyles.border.width)));
  return {
    searchfield: {
      position: "relative",
      width: "100%"
    },
    table: {
      border: "none"
    },
    dropdownContainer: { // A zero-height container designed to prevent the dropdown from taking up space in the HTML document
      padding: 0,
      margin: 0,
      position: "relative",
      height: 0,
      overflow: "visible",
      width: "100%"
    },
    input: {
      paddingRight: searchIconDimension,
      outlineOffset: 0,
      width: "100%",
      boxSizing: "border-box"
    },
    inputFocused: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderBottom: "none",
      marginBottom: 0,
      paddingBottom: renderSize(reduceSizes((acc, s) => acc + s, [parseSize(BaseStyles.border.width), parseSize(BaseStyles.padding)]))
    },
    dropdown: { // The dropdown in which search results are displayed
      boxSizing: "border-box",
      overflow: "hidden",
      zIndex: "100",
      position: "absolute",
      width: "100%",
      borderWidth: halfBorder,
      borderStyle: "solid",
      borderColor: BaseStyles.input.selectedBorderColor,
      borderBottomLeftRadius: BaseStyles.border.radius,
      borderBottomRightRadius: BaseStyles.border.radius,
      borderTop: "none",
      backgroundColor: BaseStyles.input.backgroundColor
    },
    searchIcon: {
      pointerEvents: "none",
      cursor: "default",
      position: "absolute",
      left: "auto",
      top: BaseStyles.padding,
      bottom: BaseStyles.padding,
      right: BaseStyles.padding,
      height: searchIconDimension,
      color: BaseStyles.input.placeholderColor
    },
    valueLink: {
      margin: 0,
      height: BaseStyles.elementHeight
    }
  };
}

function SearchResultsView({ searchField, collectionView }) {
  let elements = collectionView.getElements();
  if (elements.length === 0) return <Flex style={{ margin: `${BaseStyles.padding} 0` }} container alignItems="center" justifyContent="center">No Results</Flex>;
  return (
    <Flex container column style={{ backgroundColor: "transparent" }}>
      {elements.map((element, idx) =>
      <Flex component={Button} style={{ ...style.table.row,
                     ...idx % 2 ? style.table.oddRow : {},
                     ...style.table.column}}
            disableBaseStyles
            hoverStyle={style.table.rowHover}
            activeStyle={style.table.rowActive}
            onClick={() => {
                let onClick = searchField.getClickAction();
                if (onClick) onClick();
                searchField.selectElement(element);
                if (searchField.isStandalone()) {
                  searchField.reset();
                  searchField.blur();
                }
            }}>
        {h(searchField.getLinkComponent(), { element: element })}
      </Flex>)}
    </Flex>
  );
}

class SearchField extends FormElement {
  constructor(props) {
    super(props);
    this.inputNode = null; // a ref
    this.collectionView = null; // a ref
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.state = {
      ...this.state,
      search: this.props.search,
      focused: false
    };
  }

  blur() {
    if (this.inputNode) this.inputNode.base.blur();
  }

  focus() {
    if (this.inputNode) this.inputNode.base.focus();
  }

  get showsObject() {
    return Boolean(this.value) && !this.props.standalone;
  }

  onSearchChange(e) {
    this.setState(st => ({ ...st, search: e.target.value }));
  }

  onFocus() {
    this.setState(st => ({ ...st, focused: true }));
  }

  onBlur() {
    this.setState(st => ({ ...st, focused: false }));
  }

  onKeyUp(e) {
    if (e.key === "Enter") {
      this.blur();
      if (this.collectionView && this.collectionView.isLoaded()) {
        let es = this.collectionView.getElements();
        if (es.length > 0) {
          this.reset();
          this.selectElement(es[0]);
        }
      }
    }
  }

  reset() {
    this.setState(st => ({ ...st, search: null }));
    this.value = null;
  }

  selectElement(v) {
    if (this.isStandalone()) {
      Router.push(this.collectionView.getCollection().baseURL + v.id);
    } else {
      this.setState(st => ({ ...st, search: null, value: v }));
      if (this.props.onValue) {
        this.props.onValue(v);
      }
    }
  }

  isStandalone() {
    return this.props.standalone;
  }

  getLinkComponent() {
    return this.props.component;
  }

  getClickAction() {
    return this.props.onClick;
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    if (this.props.search !== nextProps.search) {
      this.setState(st => ({ ...st, search: nextProps.search }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
        || this.state.search !== nextState.search
        || this.state.focused !== nextState.focused;
  }

  render({ value, standalone, // eslint-disable-line no-unused-vars
           api, component, ...props }, { focused, search }) {
    let styles = getStyles();
    return (
      <div style={styles.searchfield}>
        { this.showsObject &&
          <Flex container row alignItems="center">
            <Flex container alignItems="center" justifyContent="center"
                  component={Anchor}
                  href={api.baseURL + this.value.id}
                  style={styles.valueLink}>
              {h(component, { element: this.value })}
            </Flex>
            <DeleteButton onClick={this.reset} />
          </Flex>}
        { !this.showsObject &&
         <svg style={styles.searchIcon} viewBox="0 0 512 512">
           <path style={{fill: "currentColor"}} d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"/>
         </svg>}
        { !this.showsObject &&
          <Input
            {...props}
            text ignore
            style={focused ? { ...styles.input, ...styles.inputFocused } : styles.input}
            value={focused ? search : null}
            ref={n => this.inputNode = n}
            onKeyUp={this.onKeyUp}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInput={this.onSearchChange}
          />
        }
        { !this.showsObject && focused &&
          <div style={styles.dropdownContainer}>
            <CollectionView
              ref={n => this.collectionView = n}
              collection={api}
              search={search}
              showsControls={false}
              style={styles.dropdown}>
              <SearchResultsView searchField={this} />
            </CollectionView>
          </div>
        }
      </div>
    );
  }
}

SearchField.propTypes = {
  component: PropTypes.func.isRequired,
  api: PropTypes.instanceOf(APICollection).isRequired,
  search: PropTypes.string,
  standalone: PropTypes.bool,
  onClick: PropTypes.func
};

SearchField.defaultProps = {
  search: null,
  standalone: false,
  placeholder: "search...",
  onClick: () => undefined
};

export { SearchField };
export default SearchField;
