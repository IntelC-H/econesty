const style = {
  text: {
    script: {
      fontFamily: "'Sacramento', cursive",
      fontStyle: "normal",
      fontWeight: "400"
    },
    crypto: {
      fontFamily: "'Inconsolata', monospace",
      letterSpacing: "1px",
      maxWidth: "100%",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all"
    },
    vertical: {
      transform: "rotate(180deg)",
      textAlign: "center",
      //color: $accent-color,
      writingMode: "vertical-lr",
      width: "1em"
    },
    italic: {
      fontStyle: "italic"
    },
    ellipsis: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  },
  shape: {
    circular: {
      borderRadius: "50%"
    }
  },
  element: {
    frownMessage: {
      opacity: "0.4",
      textAlign: "center"
    },
    page: {
      backgroundColor: "white",
      fontFamily: "'Lato', sans-serif"
    },
    privateKey: {
      marginTop: 0
    }
  }
};

export default style;

