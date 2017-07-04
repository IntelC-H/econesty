import React from 'react';
import PropTypes from 'prop-types';

// TODO: prop-types:
// 1. signature: string or array?
// All other props are passed onto the canvas

function sigToCSV(sig) {
  if (!sig) return "x,y\n";
  if (sig instanceof String) return sig;
  var lines = ["x,y"];
  sig.forEach(s => {
    s.forEach(pt => lines.push(pt.join(",")));
    lines.push("null,null");
  });
  return lines.join("\n");
}

function sigFromCSV(csv) {
  if (!csv) return [];
  if (csv instanceof Array) return csv;
  var lines = csv.split("\n");
  if (lines.length == 0) return null;
  var header = lines.shift();
  if (header != "x,y") return null;
  if (lines.length == 0) return [];
  var sig = [];
  var currentStroke = [];
  lines.forEach(l => {
    if (l == "null,null") {
      sig.push(currentStroke);
      currentStroke = [];
    } else {
      currentStroke.push(l.split(',').map(parseInt));
    }
  });
  return sig;
}

class SignatureField extends React.Component {
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

  get signature() { return sigToCSV(this.props.signature || this.state.signature); }
  get canEdit() { return this.props.signature === undefined; }

  reset() { this.setState(st => ({ ...st, signature: [], currentStroke: [] })); }

  // ReactJS overrides

  componentDidMount() { this.drawCanvas(); }
  componentDidUpdate() { this.drawCanvas(); }

  render() {
    const {className, onMouseDown, onMouseUp, onMouseMove, signature, ...props} = this.props;
    return <canvas
            ref={((e) => this.canvas = e).bind(this)}
            className={"signaturefield " + className}
            onMouseOut={this.onMouseOut}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            {...props}
           />;
  }

  // Internal Rendering Helpers

  drawCanvas() {
    var ctx = this.canvas.getContext('2d');
    ctx.lineWidth = this.props.lineWidth || "2"
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.beginPath();
    var sig = sigFromCSV(this.props.signature || this.state.signature);
    console.log(this.state.signature);
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
    if (this.canEdit) {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      f({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  // SyntheticEvent handlers

  onMouseOut(e) {
    if (this.state.isMouseDown) this.finishStroke();
    if (this.props.onMouseOut) this.props.onMouseOut(e);
  }

  onMouseDown(e) {
    this.editSignature(e, ({x, y}) => this.mapCurrentStroke(_ => [[x, y]]));
    if (this.props.onMouseDown) this.props.onMouseDown(e);
  }
    
  onMouseUp(e) {
    this.editSignature(e, ({x, y}) => this.finishStroke(x, y));
    if (this.props.onMouseUp) this.props.onMouseUp(e);
  }
  
  onMouseMove(e) {
    this.editSignature(e, ({x, y}) => this.state.isMouseDown ? this.mapCurrentStroke(cs => cs.concat([[x, y]])) : undefined);
    if (this.props.onMouseMove) this.props.onMouseMove(e);
  }
}

export default SignatureField;
