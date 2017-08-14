import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { makeClassName } from 'app/pure';

const Loading = props => {
  const { className, ...filteredProps } = props;
  return <div className={makeClassName(className, "loading")} {...filteredProps} />
}

const ErrorDisplay = props => {
  return <div className="error"><p>{props.message}</p></div>;
}

const propTypes = {
  object: PropTypes.object,
  error: PropTypes.object,
  showsLoading: PropTypes.bool,
  component: PropTypes.any.isRequired // A (P)React `Component`
};

const defaultProps = {
  object: null,
  error: null,
  showsLoading: true
};

const Resource = props => {
  const { showsLoading, error, component, ...filteredProps } = props;
  if (error) return <ErrorDisplay message={error.message} />;
  if (props.object) return h(component, filteredProps); // keep object in props
  if (showsLoading) return <Loading />;
  return null
};

Resource.propTypes = propTypes;
Resource.defaultProps = defaultProps;

export { Resource, Loading, ErrorDisplay };

export default {
  Resource: Resource,
  Loading: Loading,
  ErrorDisplay: ErrorDisplay
};