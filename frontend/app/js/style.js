/*

style.js
Provides styles for Econesty.

*/

import palette from 'app/palette';
import BaseStyles from 'base/style';
import { parseSize, renderSize, fmapSize } from 'base/style/sizing';
import { darken, parseColor, renderColor } from 'base/style/colors';

const style = {
  text: {
    primary: {
      fontSize: BaseStyles.elementHeight
    },
    secondary: {
      fontSize: renderSize(fmapSize(s => s / 2, parseSize(BaseStyles.elementHeight)))
    },
    tertiary: {
      fontSize: renderSize(fmapSize(s => s / 3, parseSize(BaseStyles.elementHeight)))
    },
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
  table: {
    base: {
      outline: `${BaseStyles.border.width} solid ${BaseStyles.border.color}`,
      boxSizing: "border-box",
      backgroundColor: "transparent"
    },
    column: {
      padding: BaseStyles.padding
    },
    row: {
      textAlign: "left",
      backgroundColor: "white"
    },
    rowHover: {
      backgroundColor: renderColor(darken(parseColor("white"), 10))
    },
    rowActive: {
      backgroundColor: renderColor(darken(parseColor("white"), 15))
    },
    oddRow: {
      backgroundColor: renderColor(darken(parseColor("white"), 5))
    }
  },
  element: {
    frownMessage: {
      opacity: "0.4",
      textAlign: "center",
      margin: BaseStyles.padding
    },
    page: {
      color: palette.textColor,
      backgroundColor: "white",
      fontFamily: "'Lato', sans-serif",
      minHeight: "100vh"
    }
  }
};

export default style;

