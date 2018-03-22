import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import { Motion, TransitionMotion, spring, presets } from 'preact-motion';

function FadeTransition({ children, preset, ...props }) {
  return (
    <TransitionMotion
      willLeave={() => ({ opacity: spring(0, preset)})}
      willEnter={() => ({ opacity: 0 })}
      styles={children.map((c, idx) => ({
        key: (c ? c.attributes.key : null) || `child-${idx}`,
        data: { child: c },
        style: { opacity: spring(1, preset) }
      }))}>
      {xs => 
        <div {...props}>
          {xs.map(({data, ...newprops}) => {
            let flag = newprops.style.opacity < 1;
            return data.child ? cloneElement(data.child, {...newprops, transparent: flag, opaque: !flag}) : null;
          })}
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
