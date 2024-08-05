// Definitions of REST API collections
import { API, APICollection } from 'app/api';
import PropTypes from 'prop-types';

const baseShape = {
  id: PropTypes.number,
  created_at: PropTypes.string // maybe date?
};

const stringOrInteger = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);

API.user = new APICollection("user");
API.user.shape = PropTypes.shape({
  id: PropTypes.number,
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  username: PropTypes.string,
  date_joined: PropTypes.string,
  avatar_url: PropTypes.string
});

API.token = new APICollection("token");
API.token.shape = PropTypes.shape({
  user: API.user.shape,
  key: PropTypes.string
});

API.wallet = new APICollection("wallet");
API.wallet.shape = PropTypes.shape({
  ...baseShape,
  user: API.user.shape,
  private_key: PropTypes.string,
  address: PropTypes.string
});

API.transaction = new APICollection("transaction");
API.transaction.shape = PropTypes.shape({
  ...baseShape,
  sender: API.user.shape,
  recipient: API.user.shape,
  sender_wallet: API.wallet.shape,
  recipient_wallet: API.wallet.shape,
  amount: stringOrInteger,
  completed: PropTypes.bool,
  success: PropTypes.bool
});

API.requirement = new APICollection("requirement");
API.requirement.shape = PropTypes.shape({
  ...baseShape,
  user: API.user.shape,
  text: PropTypes.string,
  transaction: API.transaction.shape,
  signature: PropTypes.string,
  acknowledged: PropTypes.bool
});
