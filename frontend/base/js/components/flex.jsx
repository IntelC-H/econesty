import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

function IsString(str) {
  return (props, propName, componentName) => {
    if (props[propName] !== str) {
      return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
    }
    return undefined;
  };
}

function Flex({ children, style,
                container, justifyContent, direction, wrap, alignContent, alignItems, // container props
                order, grow, shrink, basis, align,                                    // item props
                 ...props}) {
  let stylep = {...style};
  if (container) {
    stylep.display = "flex";
    if (justifyContent) stylep.justifyContent = justifyContent;
    if (direction) stylep.flexDirection = direction;
    if (wrap) stylep.flexWrap = wrap;
    if (alignContent) stylep.alignContent = alignContent;
    if (alignItems) stylep.alignItems = alignItems;
  }

  let hasGrow = grow !== null && grow !== undefined;
  let hasShrink = shrink !== null && basis !== undefined;
  let hasBasis = basis !== null && basis !== undefined;
  if (order !== null && order !== undefined) stylep.order = order;
  //if (hasGrow && hasShrink && hasBasis) {
  //  stylep.flex = `${grow} ${shrink} ${basis}`;
  //} else {
    if (hasGrow) stylep.flexGrow = grow;
    if (hasShrink) stylep.flexShrink = shrink;
    if (hasBasis) stylep.flexBasis = basis;
  //}
  if (align !== null && align !== undefined) stylep.alignSelf = align;

  return <div {...props} style={stylep}>{children}</div>;
}

Flex.defaultProps = {
  style: {},
  container: false
};

Flex.propTypes = {
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
  direction: PropTypes.oneOf([
    "row",
    "row-reverse",
    "column",
    "column-reverse"
  ]),
  wrap: PropTypes.oneOf([
    "nowrap",
    "wrap",
    "wrap-reverse"
  ]),
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
  ])
};

export { Flex };
export default Flex;
