/*
  Utilities for manipulating sizes
*/

let units = [
  "em",
  "ex",
  "%",
  "px",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "ch",
  "rem",
  "vh",
  "vw",
  "vmin",
  "vmax"
];

let sizeRegexStr = "^(\\d*(\\.\\d+)?)\s*(" + units.join('|') + ")$";
const SIZE_REGEX = new RegExp(sizeRegexStr);

function parseSize(s) {
  let m = s.match(SIZE_REGEX);
  if (m) {
    return {
      v: m[2] ? parseFloat(m[1]) : parseInt(m[2]),
      u: m[3]
    };
  }
  return null;
}

function renderSize({ v, u }) {
  return `${v}${u}`;
}

function fmapSize(f, { v, ...xs }) {
  return { v: f(v), ...xs };
}

export { parseSize, renderSize, fmapSize };
