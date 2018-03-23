import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

function AutoOr(propType) {
  return (props, propName, componentName) => {
    if (props[propName] !== "auto" && !propType(props, propName, componentName)) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
    return undefined;
  };
}

function FlexContainer({ children, justifyContent, direction, wrap, alignContent, alignItems, style, ...props}) {
  let stylep = {...style, display: "flex"};
  if (justifyContent) stylep.justifyContent = justifyContent;
  if (direction) stylep.flexDirection = direction;
  if (wrap) stylep.flexWrap = wrap;
  if (alignContent) stylep.alignContent = alignContent;
  if (alignItems) stylep.alignItems = alignItems;
  return <div {...props} style={stylep}>{children}</div>;
}

FlexContainer.defaultProps = {
  style: {}
};

FlexContainer.propTypes = {
  style: PropTypes.object,
  justifyContent: PropTypes.oneOf([
    null,
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
  ])
};

function FlexItem({children, order, grow, shrink, basis, align, style, ...props}) {
  let stylep = {...style};
  if (order !== null && order !== undefined) stylep.order = order;
  if (grow !== null && grow !== undefined) stylep.flexGrow = grow;
  if (shrink !== null && shrink !== undefined) stylep.flexShrink = shrink;
  if (basis !== null && basis !== undefined) stylep.flexBasis = basis;
  if (align !== null && align !== undefined) stylep.alignSelf = align;
  return <div {...props} style={stylep}>{children}</div>;
}

FlexItem.propTypes = {
  order: PropTypes.number,
  grow: PropTypes.number,
  shrink: PropTypes.number,
  basis: AutoOr(PropTypes.number),
  align: PropTypes.oneOf([
    "auto",
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "baseline"
  ])
};

export { FlexContainer, FlexItem };
export default { FlexContainer: FlexContainer, FlexItem: FlexItem };
