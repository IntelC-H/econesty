import { h, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

function prependFunc(obj, fname, newf) {
  let oldf = obj[fname];
  if (!oldf) obj[fname] = newf;
  else obj[fname] = function() {
    newf.apply(obj, arguments);
    oldf.apply(obj, arguments);
  };
  return obj;
}

function makeClassName() {
  let ret = Array.from(arguments).filter(Boolean).join(' ');
  return ret.length === 0 ? undefined : ret;
}

function inheritClass(comp, cname) {
  return ({className, ...props}) =>
    h(comp, {...props, className: makeClassName(cname, className)});
}

function cssSubclass(BaseComponent, // React component (functions, Component subclasses, "div" et al)
                     mapping // Object {prop => className}, if prop is present, className is appended to the element's className
                     ) {
  const f = ({className, ...props}) => {
    let classes = [className];

    for (let k in props) {
      if (k in mapping) {
        let v = props[k];
        if (Boolean(v) && v !== false && v !== "false") {
          classes.push(mapping[k]);
        }
      }
    }

    props.className = makeClassName.apply(this, classes);

    const Comp = BaseComponent instanceof Function ? BaseComponent(props) : BaseComponent;
    return h(Comp, props);
  };

  f.propTypes = {};
  f.defaultProps = {};

  for (let k in mapping) {
    f.propTypes[k] = PropTypes.bool;
    f.defaultProps[k] = false;
  }

  return f;
}

export { prependFunc, makeClassName, inheritClass, cssSubclass };

export default {
  prependFunc: prependFunc,
  makeClassName: makeClassName,
  inheritClass: inheritClass,
  cssSubclass: cssSubclass
};
