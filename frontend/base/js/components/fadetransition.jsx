import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import { TransitionMotion, spring } from 'preact-motion';
import ShouldNotUpdate from './shouldnotupdate';

function FadeTransition({ children, preset, ...props }) {
  return (
    <TransitionMotion
      willLeave={({ data }) => (data.child.attributes.style || {}).opacity < 1 ? null : data.child.attributes.fadeOut ? { opacity: spring(0, preset)} : null}
      willEnter={() => ({ opacity: 0 })}
      styles={children.filter(Boolean).map((c, idx) => ({
        key: (c ? c.attributes.key : null) || `child-${idx}`,
        data: { child: c },
        style: { opacity: c.attributes.fadeIn ? spring(1, preset) : 1 }
      }))}>
      {xs =>
        <div {...props}>{xs.map(({data, ...newprops}) =>
          <div {...newprops} className="fade-element" transparent={newprops.style.opacity < 1}>
            <ShouldNotUpdate component='div'>
              {data.child}
            </ShouldNotUpdate>
          </div>
        )}</div>}
    </TransitionMotion>
  );
}

FadeTransition.defaultProps = {
  preset: {stiffness: 100, damping: 40},
  children: []
};

export { FadeTransition };
export default FadeTransition;
