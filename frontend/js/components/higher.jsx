import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Grid, GridUnit, Button } from 'app/components/elements';
import { Resource } from 'app/components/elements';

// Comp: a component whose props should be loaded asynchronously. 
// onMount: when the component is mounted, called with a single argument: setState (see below).
// onUnmount: see onMount, except it's called when the component is unmounted.
//
// Additional Props
// setState: set the state of the underlying class-Component. The value is assumed
//           to be an Object. Async.props and Async.state are combined and fed as
//           props to Comp.
//
// forceUpdate: forces the component to update.
export function asyncWithProps(Comp, onMount = null, onUnmount = null) {
  return class Async extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.setState = this.setState.bind(this);
      this.forceUpdate = this.forceUpdate.bind(this);
    }

    componentDidMount() {
      if (onMount) {
        onMount(this.setState);
      }
    }

    componentWillUnmount() {
      if (onUnmount) {
        onUnmount(this.setState);
      }
    }

    render() {
      return <Comp
              setState={this.setState}
              forceUpdate={this.forceUpdate}
              {...this.props}
              {...this.state}
             />;
    }
  };
}

export function asyncWithObject(Comp, onMount = null, onUnmount = null, showsLoading = true) {
  return asyncWithProps(withProps({showsLoading: showsLoading, component: Comp}, Resource), onMount, onUnmount);
}

export function withPromise(promise, Comp, showsLoading = true) {
  return asyncWithObject(
    Comp,
    setState => promise.catch(e => setState({error: e})).then(o => setState({object: o})),
    null,
    showsLoading
  );
}

export function withPromiseFactory(pfact, Comp, showsLoading = true) {
  return props => h(withPromise(pfact(props), withProps(props, Comp), showsLoading), {});
}

export function collection(header, body, setPage = null) {
  const Header = header || (() => null);
  const Body = body || (() => null);
  const mkNavButton = (targetPage, text) => <Button key={targetPage} disabled={targetPage === null} className="margined raised" onClick={() => setPage(targetPage)}>{text}</Button>;

  return props => {
    const { object, className, ...filteredProps } = props;
    return (
      <div className={(className || "") + " collection"} {...filteredProps}>
        <Table striped horizontal className="fill-width">
          <thead>
            <Header object={object} />
          </thead>
          <tbody>
            {object.results.map((child, i) => <Body key={i} object={child} />)}
          </tbody>
        </Table>
        <Grid className="collection-controls">
          <GridUnit className="center collection-control" size="1-3">
            {setPage && mkNavButton(object.previous, "❮")}
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            <div className="collection-page-indicator">
              <span>{object.page} of {Math.ceil(object.count/10) || 1}</span>
            </div>
          </GridUnit>
          <GridUnit className="center collection-control" size="1-3">
            {setPage && mkNavButton(object.next, "❯")}
          </GridUnit>
        </Grid>
      </div>
    )
  };
}

export function asyncCollection(header, body, makePromise, showsLoading = true) {
  return asyncWithProps(props => h(
    withPromise(
      makePromise(props.page || 1),
      collection(header, body, p => props.setState({page: p})),
      showsLoading
    ),
    props
  ));
}

export function withProps(addlProps, Component) {
  return mapProps(props => Object.assign({}, props, addlProps), Component);
}

export function withObject(obj, comp) {
  return withProps({object: obj}, comp);
}

export function mapProps(f, Component) {
  return props => h(Component, f(props));
}

export function wrap(Wrapper, Comp) {
  return props => <Wrapper><Comp {...props} /></Wrapper>;
}

export default {
  collection: collection,
  asyncCollection: asyncCollection,
  withProps: withProps,
  withObject: withObject,
  mapProps: mapProps,
  asyncWithProps: asyncWithProps,
  asyncWithObject: asyncWithObject,
  withPromise: withPromise,
  withPromiseFactory: withPromiseFactory,
  wrap: wrap
};
