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

function reduceSizes(f, sz) {
  let unit = undefined;
  let values = [];
  for (let { v, u } of sz) {
    if (unit === undefined) unit = u;
    if (u !== unit) throw "fmapSizes(): mismatching units: " + unit + ", " + u;
    values.push(v);
  }
  return { v: values.reduce(f), u: unit };
}

export { parseSize, renderSize, fmapSize, reduceSizes };
