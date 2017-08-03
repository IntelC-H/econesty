import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { guid, Table, Grid, GridUnit, Button } from 'app/pure';

// Comp: a component whose props should be loaded asynchronously.
// func(setAsync) => { ... code that uses setAsync ... }: A function to async load props
// onMount and onUnmount are two such functions.
export function asyncWithProps(Comp, onMount = () => undefined, onUnmount = () => undefined) {
  return class Async extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.setState = this.setState.bind(this);
    }

    componentDidMount() {
      onMount(this.setState);
    }

    componentWillUnmount() {
      onUnmount(this.setState);
    }

    render() {
      return <Comp setAsync={this.setState}
                   setState={this.setState} // for linkedstate compatibility.
                   {...this.props}
                   {...this.state}
             />;
    }
  };
}

export function asyncWithObject(Comp, onMount = () => undefined, onUnmount = () => undefined, showsLoading = true) {
  const loadingComponent = props => {
    if (props.object) return <Comp {...props} />;
    if (props.error) return <div className="error"><p>{props.error.message}</p></div>;
    if (showsLoading) return <div className="loading" />;
    return null
  }
  return asyncWithProps(loadingComponent, onMount, onUnmount);
}

export function withPromise(promise, Comp, showsLoading = true) {
  return asyncWithObject(
    Comp,
    setAsync => promise.catch(e => setAsync({error: e})).then(o => setAsync({object: o})),
    () => undefined,
    showsLoading
  );
}

export function withPromiseFactory(pfact, Comp, showsLoading = true) {
  return props => {
    const C = withPromise(pfact(props), withProps(props, Comp), showsLoading);
    return <C />;
  };
}

export function collection(header, body, setPage = null) {
  const Header = header || (() => null);
  const Body = body || (() => null);
  const mkNavButton = (targetPage, text) => <Button key={guid()} disabled={targetPage === null} className="margined raised" onClick={() => setPage(targetPage)}>{text}</Button>;

  return props => {
    const { object, className, ...filteredProps } = props;
    return (
      <div className={className || "" + " collection"} {...filteredProps}>
        <Table striped horizontal className="fill-width">
          <thead>
            <Header object={object} />
          </thead>
          <tbody>
            {object.results.map((child, i) => <Body key={"object-" + i.toString()} object={child} />)}
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
  return asyncWithProps(props => {
    const Promised = withPromise(
      makePromise(props.page || 1),
      collection(header, body, p => props.setAsync({page: p})),
      showsLoading
    );
    return <Promised {...props} />;
  });
}

export function withProps(addlProps, Component) {
  return mapProps(props => Object.assign({}, props, addlProps), Component);
}

export function withObject(obj, comp) {
  return withProps({object: obj}, comp);
}

export function mapProps(f, Component) {
  return props => <Component {...f(props)} />;
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
