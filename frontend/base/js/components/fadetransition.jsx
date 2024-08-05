import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import { TransitionMotion, spring } from 'preact-motion';
import { doNotUpdate } from './utilities';

const zeroHeightStyle = {
  height: 0,
  overflow: "visible",
  position: "absolute"
  //width: "100%"
};

function _attr(el, key, dflt = undefined) {
  return el ? (el.attributes || {})[key] || dflt : dflt;
}

function FadeTransition({ children, preset, ...props }) {
  return (
    <TransitionMotion
      willLeave={({ data }) => _attr(data.child, "fadeOut", false) ? { opacity: spring(0, preset), leaving: 1 } : null}
      willEnter={() => ({ opacity: 0 })}
      styles={children.filter(Boolean).map((c, idx) => ({
        key: _attr(c, "key", `child-${idx}`),
        data: { child: doNotUpdate(c) },
        style: { opacity: _attr(c, "fadeIn", false) ? spring(1, preset) : 1 }
      }))}>
      {xs =>
      <div {...props}>
        {xs.map(({data, key, style}) =>
        <div key={key} style={style.leaving ? {...style, ...zeroHeightStyle} : style}>
          {data.child}
        </div>)}
      </div>}
    </TransitionMotion>
  );
}

FadeTransition.defaultProps = {
  preset: {stiffness: 100, damping: 40},
  children: []
};

export { FadeTransition };
export default FadeTransition;
