/*
  Mixins
*/

function noSelect() {
  return {
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none", // prevent callout sheets on iOS
    WebkitUserDrag: "none", // prevent user drag
    msUserSelect: "none",
    userSelect: "none"
  };
}

function appearance(v) {
  return {
    WebkitAppearance: v,
    MozAppearance: v,
    appearance: v
  };
}

export { noSelect, appearance };
