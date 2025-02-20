import { h, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

function makeClassName() {
  var ret = [].concat.apply([], Array.from(arguments).filter(a => !!a).map(a => a.split(' '))).filter(e => e.length > 0).join(' ');
  return ret.length === 0 ? undefined : ret;
}

function inheritClass(comp, cname) {
  return props => h(comp, Object.assign({}, props, { className: makeClassName(props.className, cname) }));
}

// A Custom PropType for pure sizes
function sizeProp(props, propName, componentName) {
  const val = props[propName];
  if (!val) return undefined;
  if (!/^(\d+)(?:-(\d+))?$/.test(val) || !(val instanceof String)) {
    return new Error('Invalid size `' + propName + '` supplied to' + ' `' + componentName + '`.');
  }
  return undefined;
}

// Given a baseClass and props, return the derivative class
// names of baseClass that implement the sizing in props.
const sizingClasses = (baseClass, props) => {
  var classes = [];

  pureSizes.slice().reverse().forEach(sz => {
    if (props.hasOwnProperty(sz)) {
      classes.push(baseClass + '-' + sz + '-' + props[sz]);
    }
  });

  if (props.size) {
    classes.push(baseClass + '-' + props.size);
  }

  if (classes.length === 0) {
    classes.push(baseClass);
  }

  return classes;
};

// makes a component that assigns props to additional classes
// BaseComponent => Either a function that takes props and returns
//                  an HTML tagname or an HTML tagname.
// mapping => An object whose keys are props (in Preact parlance, attributes)
//            and whose values are the classes they correspond to.
// baseClass => An invariant class. Used with sizing.
// supportsSizing => Turn on/off PureCSS sizing. For example, pure-u and pure-input
//                   support sizing.
const cssSubclass = (BaseComponent, mapping, baseClass, supportsSizing = false) => {
  const f = props => {
    var propsCopy = {};
    var classes = [];

    if (baseClass)       classes.push(baseClass);
    if (supportsSizing)  sizingClasses(baseClass, props).forEach(c => classes.push(c));
    else if (props.className) classes.push(props.className);

    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        var v = props[k];
        if (mapping.hasOwnProperty(k)) {
          if (!!v || v === "true") {
            classes.push(mapping[k]);
          }
        } else {
          propsCopy[k] = v;
        }
      }
    }

    propsCopy.className = makeClassName.apply(this, classes);

    const Comp = BaseComponent instanceof Function ? BaseComponent(propsCopy) : BaseComponent;
    return h(Comp, propsCopy);
  };

  f.propTypes = {};
  f.defaultProps = {};

  for (var k in mapping) {
    f.propTypes[k] = PropTypes.bool;
    f.defaultProps[k] = false;
  }

  if (supportsSizing) {
    f.defaultProps.size = "1";
    f.propTypes.size = sizeProp;
    pureSizes.forEach(s => {
      f.propTypes[s] = sizeProp;
    });
  }

  return f;
}

const pureSizes = ["sm", "md", "lg", "xl"];

export { makeClassName, inheritClass, sizeProp, sizingClasses, cssSubclass, pureSizes };

export default {
  makeClassName: makeClassName,
  inheritClass: inheritClass,
  sizeProp: sizeProp,
  sizingClasses: sizingClasses,
  cssSubclass: cssSubclass,
  pureSizes: pureSizes
}
