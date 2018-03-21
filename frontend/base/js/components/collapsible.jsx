import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { TransitionMotion, Motion, spring, presets } from 'preact-motion';
import { makeClassName } from './utilities';

class Collapsible extends Component {
  constructor(props) {
    super(props);
    this.state = {
	contentVisible: false
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(st => ({...st, contentVisible: !st.contentVisible }));
  }

  render({ children, label, className, ...props }, { contentVisible }) {
    let containerProps = {
      ...props,
      className: makeClassName(contentVisible ? "collapsible collapsible-visible" : "collapsible", className)
    };

    let preset = presets.wobbly;

    return (
      <div {...containerProps}>
        <label onClick={this.toggle}>
          <Motion style={{angle: spring(contentVisible ? 90 : 0, presets.wobbly)}}>
            {({ angle }) => <span className="fa fa-caret-right disclosure" style={{transform: "rotate(" + angle + 'deg)'}}/> }
          </Motion>
          {label}
        </label>
        <div className="content-container">
        <TransitionMotion
          willLeave={() => ({ xlate: spring(-100, preset) })}
          willEnter={() => ({ xlate: -100 })}
          styles={contentVisible ? [{
            key: "content",
            data: {},
            style: { xlate: spring(0, preset) }
          }] : []}>
          {([ content ]) => {
            if (content) {
              let xlate = content.style.xlate;
              let yscale = 1;
              if (xlate > 0) {
                yscale = 1 - (xlate / 100);
                xlate = 0;
              }
              return (
                <div key={content.key}
                     className="collapsible-content"
                     style={{transform: "translateY(" + xlate + "%) scaleY(" + yscale + ")"}}>
                  {children}
                </div>
              );
            }
            return null;
          }}
        </TransitionMotion>
        </div>
      </div>
    );
  }
}

export { Collapsible };
export default Collapsible;
