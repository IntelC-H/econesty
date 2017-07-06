//import React from 'react';

function log(target, name = null, descriptor = null) {
  if (name && descriptor) {
    var oldValue = descriptor.value;

    descriptor.value = function() {
      console.log(`Calling "${name}" with`, arguments);
      return oldValue.apply(null, arguments);
    };

    return descriptor;
  }
  return function decorator() {
    if (ENV !== "production") console.log(`Calling "${target}" with`, arguments);
    return target.apply(null, arguments);
  }
}

export { log };

export default {
  log: log
};