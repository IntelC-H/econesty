import { h, Component, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Button } from './elements';

// Create elements in REST collections. Must be a direct child
// of a CollectionView.
class CollectionCreation extends Component {
  /*
    Props:
    createText: text to be displayed on the button that "opens" the creation
                form, as represented by `children`.
    cancelText: text to be displayed on the button that "closes" the creation
                form, as represented by `children`.
    children: JSX which should implement element creation for a collection.
              Rendered w/ the prop `collectionView` which refers to the the
              enclosing CollectionView.
  */
  constructor(props) {
    super(props);
    this.setVisible = this.setVisible.bind(this);
    this.state = { visible: false };
  }

  setVisible(visible) {
    this.setState({ visible: visible });
  }

  render({ children, collectionView, createText, cancelText, peers, ...props }) {
    if (this.state.visible) {
      if (children.length === 0) return null;

      let childProps = {
        collectionView: collectionView,
        CancelButton: () => <Button onClick={() => this.setVisible(false)}>{cancelText}</Button>
      };

      return (
        <div {...props}>
          {children.map(c => cloneElement(c, childProps))}
        </div>
      );
    }
    return (
      <div {...props}>
        {peers.map(p => cloneElement(p, {collectionView: collectionView}))}
        <Button onClick={() => this.setVisible(true)}>{createText}</Button>
      </div>
    );
  }
}

CollectionCreation.propTypes = {
  cancelText: PropTypes.string,
  createText: PropTypes.string
};
CollectionCreation.defaultProps = {
  cancelText: "Cancel",
  createText: "+ New",
  peers: []
};

export { CollectionCreation };
export default CollectionCreation;
