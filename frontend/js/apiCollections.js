// Definitions of REST API collections
import { API, APICollection, APIActionCollection } from 'app/api';
import PropTypes from 'prop-types';

API.user = new APICollection("user");
API.user.me = () => API.user.classMethod("GET", "me");
API.user.transactions = (userId) =>
  new APICollection("user/" + userId + "/transactions");
API.user.payment = otherId => API.user.instanceMethod("GET", "payment", otherId);

API.user.shape = PropTypes.shape({
  id: PropTypes.number,
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  username: PropTypes.string,
  date_joined: PropTypes.string,
  avatar_url: PropTypes.string
});

API.token = new APIActionCollection("token", res => {
  API.setToken(res.token);
  API.setUserID(res.user.id);
});
API.token.shape = PropTypes.shape({
  user: API.user.shape,
  key: PropTypes.string
});

API.payment_data = new APICollection("payment_data");
API.payment_data.shape = PropTypes.shape({
  id: PropTypes.number,
  created_at: PropTypes.string, // maybe date?
  user: API.user.shape,
  kind: PropTypes.string,
  data: PropTypes.string,
  encrypted: PropTypes.bool
});

API.transaction = new APICollection("transaction");
API.transaction.shape = PropTypes.shape({
  id: PropTypes.number,
  created_at: PropTypes.string, // maybe date?
  offer_currency: PropTypes.string,
  offer: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  buyer: API.user.shape,
  seller: API.user.shape,
  buyer_payment_data: API.payment_data.shape,
  seller_payment_data: API.payment_data.shape,
  completed: PropTypes.bool
});

API.signature = new APICollection("signature");
API.signature.shape = PropTypes.shape({
  id: PropTypes.number,
  created_at: PropTypes.string, // maybe date?
  user: API.user.shape,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]) // json
});

API.requirement = new APICollection("requirement");
API.requirement.ofMe = new APICollection("requirement", () => ({ user__id: API.getUserID() }));
API.requirement.forTransaction = (tid) => new APICollection("requirement", { transaction__id: tid });
API.requirement.shape = PropTypes.shape({
  id: PropTypes.number,
  created_at: PropTypes.string, // maybe date?
  user: API.user.shape,
  text: PropTypes.string,
  transaction: API.transaction.shape,
  signature: API.signature.shape,
  signature_required: PropTypes.bool,
  acknowledged: PropTypes.bool,
  acknowledgment_required: PropTypes.bool
});
