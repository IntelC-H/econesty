import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { TransitionMotion, spring, presets } from 'preact-motion';
import ShouldNotUpdate from './shouldnotupdate';

class Drawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  toggle() {
    this.setState(st => ({...st, open: !st.open }));
  }

  isOpen() {
    return this.state.open;
  }

  open() {
    this.setState(st => ({...st, open: true}));
  }

  close() {
    this.setState(st => ({...st, open: false}));
  }

  render({children, preset, animateClose, animateOpen}, {open}) {
    return (
      <div className="drawer">
        <TransitionMotion
          willLeave={() => ({ xlate: animateClose ? spring(-100, preset) : -100 })}
          willEnter={() => ({ xlate: -100 })}
          styles={open ? [{
            key: "content",
            data: {},
            style: { xlate: animateOpen ? spring(0, preset) : 0 }
          }] : []}>
          {([ content ]) => {
            if (content) {
              let xlate = content.style.xlate;
              let yscale = 1;
              if (xlate > 0) {
                yscale -= xlate / 100;
                xlate = 0;
              } else if (xlate < -100) {
                yscale -= (Math.abs(xlate) - 100) / 100;
                xlate = -100;
              }
              return (
                <div key={content.key}
                     className="drawer-content"
                     style={{transform: "translateY(" + xlate + "%) scaleY(" + yscale + ")"}}>
                  <ShouldNotUpdate>
                    {children}
                  </ShouldNotUpdate>
                </div>
              );
            }
            return null;
          }}
        </TransitionMotion>
      </div>
    );
  }
}

Drawer.defaultProps = {
  preset: presets.wobbly,
  animateClose: true,
  animateOpen: true
};

export { Drawer };
export default Drawer;
