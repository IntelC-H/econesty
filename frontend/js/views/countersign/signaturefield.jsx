import React from 'react';
import ReactDOM from 'react-dom';


// SignatureField
// props:
// - width - width of canvas element
// - height - height of canvas element
// - lineWidth - how thick the "pen" appears
// - style - the style for the canvas element
// - signature - If present, display this and don't allow editing

export default class SignatureField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signature: [], // array of strokes
      currentStroke: [], // stroke currently being draw. Array of Point's
      isMouseDown: false
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  get signature() {
    return this.props.signature || this.state.signature;
  }

  get canEdit() {
    return this.props.signature == undefined;
  }

  reset() {
    this.setState((prevState, _) => {
      return {
        signature: [],
        currentStroke: prevState.currentStroke,
        isMouseDown: prevState.isMouseDown
      };
    });
  }

  // ReactJS overrides

  componentDidUpdate() {
    this.drawCanvas();
  }

  componentDidMount() {
    this.drawCanvas();
  }

  render() {
    return <canvas
            className="signaturefield"
            style={this.props.style || {}}
            width={this.props.width || "200"}
            height={this.props.height || "320"}
            onMouseDown={(e) => this.onMouseDown(e)}
            onMouseUp={(e) => this.onMouseUp(e)}
            onMouseMove={(e) => this.onMouseMove(e)}></canvas>;
  }

  // Internal Rendering Helpers

  drawCanvas() {
    var cvs = ReactDOM.findDOMNode(this);
    var ctx = cvs.getContext('2d');
    ctx.lineWidth = this.props.lineWidth || "2"
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.beginPath();
    for (var i = 0; i < this.signature.length; i++) {
      this.drawStroke(this.signature[i], ctx);
    }
    this.drawStroke(this.state.currentStroke, ctx);
    ctx.stroke();
  }

  drawStroke(stroke, ctx) {
    if (stroke.length > 0) {
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (var i = 0; i < stroke.length; i++) {
        var pair = stroke[i];
        ctx.lineTo(pair[0], pair[1]);
      }
    }
  }

  // SyntheticEvent handlers

  onMouseDown(e) {
    if (this.canEdit) {
      e.persist();
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      this.setState((prevState, _) => {
         return {
           isMouseDown: true,
           signature: prevState.signature,
           currentStroke: [[x, y]]
         };
      });
    }
  }
    
  onMouseUp(e) {
    if (this.canEdit) {
      e.persist();
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      this.setState((prevState, _) => {
        if (prevState.isMouseDown) {
          var sig = prevState.signature;
          var stroke = prevState.currentStroke
          stroke.push([x, y]);
          sig.push(stroke);
          return {isMouseDown: false, signature: sig, currentStroke: []};
        }
        return prevState;
      });
    }
  }
   
  onMouseMove(e) {
    if (this.canEdit) {
      e.persist();
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      if (this.state.isMouseDown) {
        this.setState((prevState, _) => {
          var stroke = prevState.currentStroke;
          stroke.push([x, y]);
          return {
            isMouseDown: true,
            signature: prevState.signature,
            currentStroke: stroke
          };
        });  
      }
    }
  }
}

