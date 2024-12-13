/*
  These are the styles Base uses to style _all_ elements.
*/

// This is not directly CSS. These apply on the
// Component level, not the DOM level.
var BaseStyles = {
  elementHeight: "2.5rem",
  padding:       "0.5rem",
  border: {
    radius: "0.25rem",
    width:  "0.1rem",
    color: "#CBCBCB"
  },
  loading: {
    color:     "#555555",
    thickness: "0.5rem"
  },
  button: {
    color: "#333333",
    backgroundColor: "#E6E6E6"
  },
  deleteButton: {
    color: "#000000"
  },
  input: { // component styles for <Input /> & <Select />
    color:                   "#000000",
    placeholderColor:        "#777777",
    backgroundColor:         "#FFFFFF",
    disabledColor:           "#CAD2D3",
    disabledBackgroundColor: "#EAEDED",
    borderColor:             "#CCCCCC",
    selectedBorderColor:     "#129FEA",
    invalidBorderColor:      "#B94A48"
  }
};

export default BaseStyles;
