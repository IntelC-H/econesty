import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import FormElement from '../formelement';
import Loading from '../../loading';
import { prependFunc } from '../../utilities';

const isFunc = x => typeof x === "function";

class Select extends FormElement {
  constructor(props) {
    super(props);
    this.state = this.applyPropsToState({ ...this.state, loading: false }, props);
    this.reloadData();
  }

  get isAsync() {
    return this.state.loadOptions !== undefined && isFunc(this.state.loadOptions);
  }

  applyPropsToState(state, { value, options, transform }) {
    let optsOrEmpty = options || [];
    let additions = {transform: transform};
    if (!isFunc(options)) {
      additions.options = options;
      additions.loadOptions = null;
      if (!additions.value && optsOrEmpty.length > 0) {
        additions.value = transform(optsOrEmpty[0]);
      }
    } else {
      additions.loadOptions = options;
      additions.value = value;
    }

    return {
      ...state,
      ...additions
    };
  }

  reloadData() {
    if (this.isAsync) {
      this.setState(st => ({ ...st, loading: true }));
      this.state.loadOptions().then(es =>
        this.setState(st => ({
          ...st,
          loading: false,
          value: st.value || (es.length > 0 ? this.props.transform(es[0]) : null),
          options: es
        }))
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (super.shouldComponentUpdate(nextProps, nextState)) return true;
    if (this.state.options !== nextState.options) return true;
    if (this.state.loading !== nextState.loading) return true;
    return false;
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    this.setState(st => this.applyPropsToState(st, nextProps));
  }

  onInput(e) {
    this.value = e.target.value;
  }

  render({ value, options, // eslint-disable-line no-unused-vars
           transform, faceTransform, ...filteredProps }, { loading }) {
    if (this.isAsync && loading) return <Loading />;

    prependFunc(filteredProps, "onChange", this.onInput);

    if (!this.state.options || this.state.options.length === 0) {
      filteredProps.disabled = true;
      filteredProps.children = [<option selected={false}>No Options</option>];
    } else {
      filteredProps.children = this.state.options.map(s => {
        let sprime = transform(s);
        let isSame = (sprime ? sprime.toString() : null) === (this.value ? this.value.toString() : null);
        return <option
                 selected={isSame}
                 key={filteredProps.name + '-' + sprime}
                 value={sprime}>{faceTransform(s)}</option>;
      });
    }
    return h('select', filteredProps);
  }
}

Select.propTypes = {
  ...FormElement.propTypes,
  options: PropTypes.arrayOf(PropTypes.string),
  transform: PropTypes.func, // transform the value for the form
  faceTransform: PropTypes.func // transform the value for display
};

Select.defaultProps = {
  ...FormElement.defaultProps,
  transform: x => x,
  faceTransform: x => x,
  options: []
};

export { Select };
export default Select;
