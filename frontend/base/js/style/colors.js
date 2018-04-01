/*
  Utilities for manipulating colors
*/

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
    console.log(rgbmatch);
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
  return ((w * a) + ((1.0 - w) * b));
}

function mixColors(c1, c2, weight) {
  return mapComponents((a, b) => _weightedAvg(a, b, weight), c1, c2);
}

export { parseColor, renderColor, mixColors };
