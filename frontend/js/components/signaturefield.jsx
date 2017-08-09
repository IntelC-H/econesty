import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
//import PropTypes from 'prop-types'; // TODO: prop-types
import { Element } from 'app/pure';

// TODO: use asyncWithProps

class SignatureField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signature: [], // array of strokes
      currentStroke: [], // stroke currently being draw. Array of Point's
      isMouseDown: false
    };
    this.canvas = null;
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  reset() {
    this.setState(st => ({ ...st, signature: [], currentStroke: [] }));
  }

  // ReactJS overrides

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState(st => ({ ...st, signature: JSON.parse(nextProps.value || "[]") }));
    }
  }

  componentDidMount() {
    this.drawCanvas();
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  render() {
    const {className, onMouseDown, onMouseUp, onMouseMove, onMouseOut, value, name, editable, ...props} = this.props; // eslint-disable-line
    return (
      <div>
        <Element hidden name={this.props.name} value={JSON.stringify(this.state.signature)} />
        <canvas
            ref={e => (this.canvas = e) && undefined }
            className={"signaturefield " + className}
            onMouseOut={this.onMouseOut}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            {...props}
           />
      </div>
    );
  }

  // Canvas Rendering Helpers

  drawCanvas() {
    var ctx = this.canvas.getContext('2d');
    ctx.lineWidth = this.props.lineWidth || "2"
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.beginPath();
    var sig = this.state.signature;
    sig.concat([this.state.currentStroke])
       .filter(s => s.length > 0)
       .forEach(s => {
      ctx.moveTo(s[0][0], s[0][1]);
      s.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]));
    });
    ctx.stroke();
  }

  // State Helpers

  finishStroke(x = null, y = null) {
    this.setState(st => ({
      ...st,
      isMouseDown: !x && !y,
      signature: st.signature.concat([x && y ? st.currentStroke.concat([[x, y]]) : st.currentStroke]),
      currentStroke: []
    }));
  }

  mapCurrentStroke(f) {
    this.setState(st => ({
      ...st,
      isMouseDown: true,
      currentStroke: f(st.currentStroke)
    }));
  }

  // DRY

  editSignature(e, f) {
    if (this.props.editable) {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      f(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  // Event handlers

  onMouseOut(e) {
    this.editSignature(() => {
      if (this.state.isMouseDown) this.finishStroke();
    });
    if (this.props.onMouseOut) this.props.onMouseOut(e);
  }

  onMouseDown(e) {
    this.editSignature(e, (x, y) => this.mapCurrentStroke(() => [[x, y]]));
    if (this.props.onMouseDown) this.props.onMouseDown(e);
  }

  onMouseUp(e) {
    this.editSignature(e, (x, y) => this.finishStroke(x, y));
    if (this.props.onMouseUp) this.props.onMouseUp(e);
  }

  onMouseMove(e) {
    this.editSignature(e, (x, y) => this.state.isMouseDown ? this.mapCurrentStroke(cs => cs.concat([[x, y]])) : undefined);
    if (this.props.onMouseMove) this.props.onMouseMove(e);
  }
}

export default SignatureField;
