import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

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
  if (error) return <div className="error"><p>{error.message}</p></div>;
  if (props.object) return h(component, filteredProps);
  if (showsLoading) return <div className="loading" />;
  return null
};

Resource.propTypes = propTypes;
Resource.defaultProps = defaultProps;

export default Resource;