import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { makeClassName } from './utilities';

function IsString(str) {
  return (props, propName, componentName) => {
    if (props[propName] !== str) {
      return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
    }
    return undefined;
  };
}

function Flex({ style, className, component,
                container, justifyContent, row, rowReverse, column, columnReverse, // container props
                wrap, nowrap, wrapReverse, alignContent, alignItems,               // more container props
                order, grow, shrink, basis, align,                                 // item props
                height, width,                                                     // sizing props
                paddingLeft, paddingRight, paddingTop, paddingBottom, padding,     // padding
                marginLeft, marginRight, marginTop, marginBottom, margin,          // margin
                 ...props}) {
  let stylep = {...style};
  if (container) {
    stylep.display = "flex";
    let direction = row ? "row" : rowReverse ? "row-reverse" : column ? "column" : columnReverse ? "column-reverse" : undefined;
    let wrapV = wrap ? "wrap" : wrapReverse ? "wrap-reverse" : nowrap ? "nowrap" : undefined;
    if (justifyContent) stylep.justifyContent = justifyContent;
    if (direction) stylep.flexDirection = direction;
    if (wrapV) stylep.flexWrap = wrapV;
    if (alignContent) stylep.alignContent = alignContent;
    if (alignItems) stylep.alignItems = alignItems;
  }

  let hasGrow = grow !== null && grow !== undefined;
  let hasShrink = shrink !== null && shrink !== undefined;
  let hasBasis = basis !== null && basis !== undefined;
  if (order !== null && order !== undefined) stylep.order = order;
  if (hasGrow && hasShrink && hasBasis) {
    stylep.flex = `${grow} ${shrink} ${basis}`;
  } else {
    if (hasGrow) stylep.flexGrow = grow;
    if (hasShrink) stylep.flexShrink = shrink;
    if (hasBasis) stylep.flexBasis = basis;
  }
  if (align !== null && align !== undefined) stylep.alignSelf = align;

  if (height !== null && height !== undefined) stylep.height = height;
  if (width !== null && width !== undefined) stylep.width = width;

  let clses = [];
  if (className && className.length !== 0) clses.push(className);
  if (padding) clses.push("flex-padding");
  else {
    if (paddingLeft) clses.push("flex-padding-left");
    if (paddingRight) clses.push("flex-padding-right");
    if (paddingTop) clses.push("flex-padding-top");
    if (paddingBottom) clses.push("flex-padding-bottom");
  }
  if (margin) clses.push("flex-margin");
  else {
    if (marginLeft) clses.push("flex-margin-left");
    if (marginRight) clses.push("flex-margin-right");
    if (marginTop) clses.push("flex-margin-top");
    if (marginBottom) clses.push("flex-margin-bottom");
  }
  let newClassName = makeClassName.apply(this, clses);
  if (Boolean(newClassName)) props.className = newClassName;

  return h(component, { ...props, style: stylep});
}

Flex.defaultProps = {
  component: 'div',
  style: {},
  container: false,
  paddingTop: false,
  paddingBottom: false,
  paddingRight: false,
  paddingLeft: false,
  marginTop: false,
  marginBottom: false,
  marginLeft: false,
  marginRight: false
};

Flex.propTypes = {
  component: PropTypes.func, // A react component
  style: PropTypes.object,
  container: PropTypes.bool,
  justifyContent: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "space-evenly"
  ]),
  row: PropTypes.bool,
  rowReverse: PropTypes.bool,
  column: PropTypes.bool,
  columnReverse: PropTypes.bool,
  wrap: PropTypes.bool,
  wrapReverse: PropTypes.bool,
  nowrap: PropTypes.bool,
  alignContent: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "space-between",
    "space-around"
  ]),
  alignItems: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "baseline"
  ]),

  order: PropTypes.number,
  grow: PropTypes.number,
  shrink: PropTypes.number,
  basis: PropTypes.oneOfType([IsString("auto"), IsString("content"), IsString("fill"),
                              IsString("max-content"), IsString("min-content"), IsString("fit-content"),
                              PropTypes.number, PropTypes.string]),
  align: PropTypes.oneOf([
    "auto",
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "baseline"
  ]),
  width: PropTypes.string,
  height: PropTypes.string,
  paddingTop: PropTypes.bool,
  paddingBottom: PropTypes.bool,
  paddingLeft: PropTypes.bool,
  paddingRight: PropTypes.bool,
  marginRight: PropTypes.bool,
  marginLeft: PropTypes.bool,
  marginTop: PropTypes.bool,
  marginBottom: PropTypes.bool
};

export { Flex };
export default Flex;
