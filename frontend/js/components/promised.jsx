import React from 'react';
import PropTypes from 'prop-types';

// <PromiseComponent factory={() => return p} component={} />
// where component takes props in the form { object: /*object from promise*/ }.

const propTypes = {
  component: PropTypes.func,
  factory: PropTypes.func.isRequired
};

const defaultProps = {
  component: null
};

class Promised extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentPromise: null,
      object: null,
      error: null,
      factory: this.props.factory
    };
  }

  componentWillReceiveProps(nextProps) {
    this.useFactory(nextProps.factory);
  }

  componentDidMount() {
    this.invokePromise();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.factory != this.state.factory) {
      this.invokePromise(); // update the component in the case of the promise factory changing.
    }
  }

  useFactory(f) {
    this.setState((st) => {
      if (f !== st.factory) {
        st.factory = f;
        st.object = null;
        st.error = null;
        st.currentPromise = null;
      }
      return st;
    });
  }

  invokePromise() {
    this.setState((st) => {
      st.currentPromise = st.factory().catch((err) => {
        this.setState((stp) => {
          stp.error = err;
          stp.currentPromise = null;
          return stp;
        });
      }).then((promised) => {
        this.setState((stp) => {
          stp.object = promised;
          stp.currentPromise = null;
          return stp;
        });
      });
      st.object = null;
      st.error = null;
      return st;
    });
  }

  render() {
    if (this.state.error)          return this.renderError(this.state.error);
    if (this.state.object)         return this.renderObject(this.state.object);
    if (this.state.currentPromise) return this.renderLoading();
    return null;
  }

  renderError(err) {
    return (
      <div className="error">
        <p>{err.message}</p>
      </div>
    );
  }

  renderObject(p) {
    return React.createElement(this.props.component, { object: p }, null);
  }

  renderLoading() {
    return <div className="loading" />;
  }
}

Promised.defaultProps = defaultProps;
Promised.propTypes = propTypes;

export default Promised;
