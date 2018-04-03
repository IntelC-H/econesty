/*

style.js
Provides styles for Econesty.

*/

import palette from 'app/palette';
import BaseStyle from 'base/style';
import { parseSize, renderSize, fmapSize, reduceSizes } from 'base/style/sizing';

const halfPadding = renderSize(fmapSize(a => a / 2, parseSize(BaseStyle.padding)));

const style = {
  text: {
    primary: {
      fontSize: BaseStyle.elementHeight
    },
    secondary: {
      fontSize: renderSize(fmapSize(s => s / 2, parseSize(BaseStyle.elementHeight)))
    },
    tertiary: {
      fontSize: renderSize(fmapSize(s => s / 3, parseSize(BaseStyle.elementHeight)))
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
    tr: {

    },
    td: {
      padding: `${halfPadding} ${BaseStyle.padding}`
    }
  },
  element: {
    frownMessage: {
      opacity: "0.4",
      textAlign: "center"
    },
    page: {
      color: palette.textColor,
      backgroundColor: "white",
      fontFamily: "'Lato', sans-serif"
    }
  }
};

export default style;

