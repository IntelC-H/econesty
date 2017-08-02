import { h } from 'preact';
import PropTypes from 'prop-types';
import Components from 'app/components';

const propTypes = {
  object: PropTypes.shape({
    id: PropTypes.number,
    offer_currency: PropTypes.string,
    offer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    buyer: PropTypes.shape({
      id: PropTypes.number,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      username: PropTypes.string
    }),
    seller: PropTypes.shape({
      id: PropTypes.number,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      username: PropTypes.string
    })
  })
};

const defaultProps = {};

const Transaction = props => {
  var obj = props.object;
  return (
    <tr>
      <td><Components.Money currency={obj.offer_currency} value={parseFloat(obj.offer)} /></td>
      <td><a className="secondary" href={"/user/" + obj.buyer.id}>{obj.buyer.first_name} {obj.buyer.last_name} (@{obj.buyer.username})</a></td>
      <td><a className="secondary" href={"/user/" + obj.seller.id}>{obj.seller.first_name} {obj.seller.last_name} (@{obj.seller.username})</a></td>
    </tr>
  );
};

Transaction.propTypes = propTypes;
Transaction.defaultProps = defaultProps;

export default Transaction;
