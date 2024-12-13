import { h, cloneElement, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

function prependFunc(obj, fname, newf) {
  if (!obj[fname]) obj[fname] = newf;
  else {
    let oldf = obj[fname];
    obj[fname] = function() {
      newf.apply(obj, arguments);
      oldf.apply(obj, arguments);
    };
  }
  return obj;
}

// Wraps a React element. prevents updates to the element from the parent.
function doNotUpdate(element) {
  return h(class doNotUpdate extends Component {
    shouldComponentUpdate() {
      return false;
    }

    render() {
      return element;
    }
  }, {});
}

// Wrap a react class.
function nonUpdating(Comp) {
  return class nonUpdating extends Component {
    shouldComponentUpdate() {
      return false;
    }

    render(props) {
      return <Comp {...props} />;
    }
  };
}

function makeClassName() {
  let ret = Array.from(arguments).filter(Boolean).join(' ');
  return ret.length === 0 ? undefined : ret;
}

function choiceComponent(f) {
  return props => h(f(props), props);
}

function cssSubclass(BaseComponent, // React component (functions, Component subclasses, "div" et al)
                     mapping // Object {prop => className}, if prop is present, className is appended to the element's className
                     ) {
  const f = ({className, ...props}) => {
    let classes = [];
    if (className) classes.push(className);

    for (let k in props) {
      if (k in mapping) {
        let v = props[k];
        if (Boolean(v) && v !== "false") {
          classes.push(mapping[k]);
        }
        delete props[k];
      }
    }
    let newProps = {...props,
                    ...classes.length > 0
                         ? {className: makeClassName.apply(null, classes)}
                         : {}};
    return h(BaseComponent, newProps);
  };

  f.propTypes = {};
  f.defaultProps = {};

  for (let k in mapping) {
    f.propTypes[k] = PropTypes.bool;
    f.defaultProps[k] = false;
  }

  return f;
}

export { prependFunc, doNotUpdate, makeClassName, cssSubclass, choiceComponent, nonUpdating };

export default {
  prependFunc: prependFunc,
  doNotUpdate: doNotUpdate,
  nonUpdating: nonUpdating,
  makeClassName: makeClassName,
  cssSubclass: cssSubclass,
  choiceComponent: choiceComponent
};
