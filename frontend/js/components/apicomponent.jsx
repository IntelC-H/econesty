import React from 'react';
import PropTypes from 'prop-types';
import Promised from './promised';
import ObjectForm from './objectform';

// <APIComponent objectId={1} api={API.user} /> // shows an instance of an API
// <APIComponent list api={API.user} /> // shows a list with controls
// <APIComponent form api={API.user} />

const propTypes = {
  api: PropTypes.shape({
    create: PropTypes.func,
    read: PropTypes.func,
    update: PropTypes.func,
    delete: PropTypes.func,
    list: PropTypes.func,
    class_method: PropTypes.func,
    instance_method: PropTypes.func
  }).isRequired,
  page: PropTypes.number,
  list: PropTypes.bool,
  search: PropTypes.string,
  form: PropTypes.func,
  objectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onCreation: PropTypes.func,
  component: PropTypes.func,
  headerComponent: PropTypes.func
};

const defaultProps = {
  page: 1,
  list: false,
  search: null,
  form: null,
  objectId: null,
  onCreation: ((_) => {}),
  component: null,
  headerComponent: null
};

// Readonly API access
class APIComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.setPage = this.setPage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      error: null,
      search: this.props.search,
      page: this.props.page,
      api: this.props.api,
      list: this.props.list,
      form: this.props.form
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      error: null,
      search: nextProps.search,
      page: nextProps.page,
      api: nextProps.api,
      list: nextProps.list,
      form: nextProps.form
    });
  }

  render() {
    if (this.state.error) {
      return <Promised factory={() => Promise.reject(this.state.error)} component={(_) => null} />
    } else if (this.state.list) {
      return <Promised
               factory={() => this.search ? this.state.api.search(this.state.search, this.state.page) : this.state.api.list(this.state.page)}
               component={collection(this.props.headerComponent, this.props.component, this.setPage)}
             />
    } else if (this.state.form) {
      return <Promised
               factory={() => this.props.objectId ? this.state.api.read(this.props.objectId) : Promise.resolve({})}
               component={(props) => {
                  console.log(this.state);
                  return (<ObjectForm onSubmit={this.onSubmit}>
                    {React.createElement(this.state.form, props, null)}
                  </ObjectForm>);
               }}
             />
    } else if (this.props.objectId) {
      return <Promised
               factory={() => this.state.api.read(this.props.objectId)}
               component={this.props.component}
             />
    }
    return null;
  }

  setPage(pg) {
    this.setState((st) => {
      st.page = pg;
      return st;
    });
  }

  onSubmit(obj) {
    console.log(obj);
    this.state.api.create(obj).catch((err) => {
      this.setState((st) => {
        st.error = err;
        return st;
      });
    }).then((objp) => {
      this.setState((st) => {
        st.error = null;
        return st;
      });
      this.props.onCreation(objp);
    });
  }
}

function collection(Header, Body, setPage) {
  function render(props) {
    var obj = props.object;
    Header = Header || ((_) => null);
    Body = Body || ((_) => null);

    return (
      <div className="collection">
        <div className="collection-header">
          <Header object={obj} />
        </div>
        <div className="collection-objects">
          {obj.results.map((child, i) => <Body key={"object-" + i.toString()} object={child} />)}
        </div>
        <div className="collection-controls">
          {obj.previous && <button className="nav-button" onClick={() => setPage(obj.previous)}>❮ Previous</button>}
          <span>{obj.page} of {Math.ceil(obj.count/10) || 1}</span>
          {obj.next && <button className="nav-button" onClick={() => setPage(obj.next)}>Next ❯</button>}
        </div>
      </div>
    );
  }
  return render;
}

APIComponent.propTypes = propTypes;
APIComponent.defaultProps = defaultProps;
export default APIComponent;