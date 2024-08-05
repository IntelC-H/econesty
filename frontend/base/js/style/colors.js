/*
  Utilities for manipulating colors
*/

const NAMED_COLORS = {
  transparent: "rgba(0, 0, 0, 0)",
  aliceblue: "#F0F8FF",
  antiquewhite: "#FAEBD7",
  aqua: "#00FFFF",
  aquamarine: "#7FFFD4",
  azure: "#F0FFFF",
  beige: "#F5F5DC",
  bisque: "#FFE4C4",
  black: "#000000",
  blanchedalmond: "#FFEBCD",
  blue: "#0000FF",
  blueviolet: "#8A2BE2",
  brown: "#A52A2A",
  burlywood: "#DEB887",
  cadetblue: "#5F9EA0",
  chartreuse: "#7FFF00",
  chocolate: "#D2691E",
  coral: "#FF7F50",
  cornflowerblue: "#6495ED",
  cornsilk: "#FFF8DC",
  crimson: "#DC143C",
  cyan: "#00FFFF",
  darkblue: "#00008B",
  darkcyan: "#008B8B",
  darkgoldenrod: "#B8860B",
  darkgray: "#A9A9A9",
  darkgrey: "#A9A9A9",
  darkgreen: "#006400",
  darkKhaki: "#BDB76B",
  darkmagenta: "#8B008B",
  darkolivegreen: "#556B2F",
  darkorange: "#FF8C00",
  darkorchid: "#9932CC",
  darkred: "#8B0000",
  darksalmon: "#E9967A",
  darkseaGreen: "#8FBC8F",
  darkslateBlue: "#483D8B",
  darkslateGray: "#2F4F4F",
  darkslateGrey: "#2F4F4F",
  darkturquoise: "#00CED1",
  darkviolet: "#9400D3",
  deeppink: "#FF1493",
  deepskyblue: "#00BFFF",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1E90FF",
  firebrick: "#B22222",
  floralwhite: "#FFFAF0",
  forestgreen: "#228B22",
  fuchsia: "#FF00FF",
  gainsboro: "#DCDCDC",
  ghostwhite: "#F8F8FF",
  gold: "#FFD700",
  goldenrod: "#DAA520",
  gray: "#808080",
  grey: "#808080",
  green: "#008000",
  greenyellow: "#ADFF2F",
  honeydew: "#F0FFF0",
  hotpink: "#FF69B4",
  indianred: "#CD5C5C",
  indigo: "#4B0082",
  ivory: "#FFFFF0",
  khaki: "#F0E68C",
  lavender: "#E6E6FA",
  lavenderblush: "#FFF0F5",
  lawngreen: "#7CFC00",
  lemonchiffon: "#FFFACD",
  lightblue: "#ADD8E6",
  lightcoral: "#F08080",
  lightcyan: "#E0FFFF",
  lightgoldenrodyellow: "#FAFAD2",
  lightgray: "#D3D3D3",
  lightgrey: "#D3D3D3",
  lightgreen: "#90EE90",
  lightpink: "#FFB6C1",
  lightsalmon: "#FFA07A",
  lightseagreen: "#20B2AA",
  lightskyblue: "#87CEFA",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#B0C4DE",
  lightyellow: "#FFFFE0",
  lime: "#00FF00",
  limegreen: "#32CD32",
  linen: "#FAF0E6",
  magenta: "#FF00FF",
  maroon: "#800000",
  mediumaquamarine: "#66CDAA",
  mediumblue: "#0000CD",
  mediumorchid: "#BA55D3",
  mediumpurple: "#9370DB",
  mediumseagreen: "#3CB371",
  mediumslateblue: "#7B68EE",
  mediumspringgreen: "#00FA9A",
  mediumturquoise: "#48D1CC",
  mediumvioletred: "#C71585",
  midnightblue: "#191970",
  mintcream: "#F5FFFA",
  mistyrose: "#FFE4E1",
  moccasin: "#FFE4B5",
  navajowhite: "#FFDEAD",
  navy: "#000080",
  oldlace: "#FDF5E6",
  olive: "#808000",
  olivedrab: "#6B8E23",
  orange: "#FFA500",
  orangered: "#FF4500",
  orchid: "#DA70D6",
  palegoldenrod: "#EEE8AA",
  palegreen: "#98FB98",
  paleturquoise: "#AFEEEE",
  palevioletred: "#DB7093",
  papayawhip: "#FFEFD5",
  peachpuff: "#FFDAB9",
  peru: "#CD853F",
  pink: "#FFC0CB",
  plum: "#DDA0DD",
  powderblue: "#B0E0E6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#FF0000",
  rosybrown: "#BC8F8F",
  royalblue: "#4169E1",
  saddlebrown: "#8B4513",
  salmon: "#FA8072",
  sandybrown: "#F4A460",
  seagreen: "#2E8B57",
  seashell: "#FFF5EE",
  sienna: "#A0522D",
  silver: "#C0C0C0",
  skyblue: "#87CEEB",
  slateblue: "#6A5ACD",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#FFFAFA",
  springgreen: "#00FF7F",
  steelblue: "#4682B4",
  tan: "#D2B48C",
  teal: "#008080",
  thistle: "#D8BFD8",
  tomato: "#FF6347",
  turquoise: "#40E0D0",
  violet: "#EE82EE",
  wheat: "#F5DEB3",
  white: "#FFFFFF",
  whitesmoke: "#F5F5F5",
  yellow: "#FFFF00",
  yellowgreen: "#9ACD32"
};

// parses a CSS color string into an rgb color:
// e.g. `{ r: 255, g: 255, b: 255, a: .1 }`
const HEXCOLOR_REGEX = /^#[A-Fa-f0-9]+$/;
const RGBA_REGEX = /^rgb(a?)\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d*\.?\d+)\s*)?\)$/;
function parseColor(c) {
  let hexmatch = c.match(HEXCOLOR_REGEX);
  if (hexmatch) {
    let matched = hexmatch[0]; // includes leading #
    if (matched.length === 7) { // 6-term color
      return {
        r: parseInt(matched.substr(1, 2), 16),
        g: parseInt(matched.substr(3, 2), 16),
        b: parseInt(matched.substr(5, 2), 16)
      };
    } else if (matched.length === 4) { // 3-term color
      return {
        r: parseInt(matched.charAt(1), 16) * 0x11,
        g: parseInt(matched.charAt(2), 16) * 0x11,
        b: parseInt(matched.charAt(3), 16) * 0x11
      };
    }
    return null;
  }

  let rgbmatch = c.match(RGBA_REGEX);
  if (rgbmatch) {
    let hasAlpha = rgbmatch[1] === 'a';
    if (!hasAlpha && rgbmatch[6]) return null; // 7 is the number of groups (? check terminology) for a full RGBA match

    let obj = {
      r: parseInt(rgbmatch[2]),
      g: parseInt(rgbmatch[3]),
      b: parseInt(rgbmatch[4])
    };

    let a = parseFloat(rgbmatch[6]);
    if (hasAlpha && a < 1) obj.a = a; // the 6 is not a typo. Examine the regex.

    return obj;
  }

  let namedColor = NAMED_COLORS[c.toLowerCase()];
  if (namedColor) {
    return parseColor(namedColor);
  }

  return null;
}

function _padZero(s) {
  return s.length < 2 ? `0${s}` : s;
}

// Renders a color into either a hex string or RGBA color, depending on if it has an alpha component
function renderColor({ r, g, b, a}) {
  if (a !== null && a !== undefined && a < 1) return `rgba(${r},${g},${b},${a})`;
  return `#${_padZero(r.toString(16))}${_padZero(g.toString(16))}${_padZero(b.toString(16))}`;
}

function mapComponents() {
  let [f, ...colors] = Array.from(arguments);
  let color = {
    r: Math.floor(f.apply(null, colors.map(({ r }) => r))),
    b: Math.floor(f.apply(null, colors.map(({ b }) => b))),
    g: Math.floor(f.apply(null, colors.map(({ g }) => g)))
  };

  if (colors.some(({ a }) => a !== null && a !== undefined)) {
    color.a = f.apply(null, colors.map(({ a }) => a === null || a === undefined ? 1 : a));
  }

  return color;
}

// `w` is how much `a` is used in the average, a float from 0 to 1.
// `b`'s weight is `1.0 - w`.
function _weightedAvg(a, b, w) {
  return w * a + (1.0 - w) * b;
}

function mixColors(c1, c2, weight) {
  return mapComponents((a, b) => _weightedAvg(a, b, weight), c1, c2);
}

function darken(c1, perc) {
  return mapComponents(c => c * ((100 - perc) / 100), c1);
}

export { parseColor, renderColor, mixColors, darken };
