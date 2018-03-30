import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, XOverflowable } from 'base/components/elements';
import { GreenCheck, Warning, RedX, BTC, SideMargins} from 'app/common';
import { API, Flex, Link, CollectionView, ElementView,
         Form, FormGroup, Select, Input } from 'base/base';

function makeWalletsPromise() {
  return API.wallet.withParams({ user__id: API.getUserID() }).listAll();
}

function UserLink({ user }) {
  return (
    <Link
      className="secondary"
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Link>
  );
}

function attemptFinalize(transaction, elementView) {
  API.transaction.instanceMethod("POST", "finalize", transaction.id).then(elementView.setElement);
}

function TransactionInfo({ elementView }) {
  let t = elementView.getElement();

  let needsRecipientWallet = t.recipient_wallet === null || t.recipient_wallet === undefined;
  let needsSenderWallet = t.sender_wallet === null || t.sender_wallet === undefined;
  let isSender = t.sender.id === API.getUserID();
  let isRecipient = t.recipient.id === API.getUserID();

  return (
    <div>
      <Flex container column alignItems="center">
        <Flex container alignItems="center" justifyContent="space-between">
          {t.completed
           ? t.success ? <GreenCheck component={'h1'} /> : <Warning component={'h1'} />
           : t.rejected ? <RedX component={'h1'} /> : null}
          <h1>Transaction #{t.id}</h1>
        </Flex>
        {t.completed && !t.success &&
        <Flex container alignItems="center">
          <p>{t.error ? "Blockchain Error: " + t.error : ""}</p>
          <button onClick={() => attemptFinalize(t, elementView)}>Retry</button>
        </Flex>}
        <h3><BTC /> {parseFloat(t.amount)}</h3>
      </Flex>
      <Flex container row alignItems="center" justifyContent="center">
        <Flex basis={`${100/3}%`}>
          <Flex container justifyContent="flex-begin">
            <h3 className="secondary"><UserLink user={t.recipient} /></h3>
          </Flex>
        </Flex>
        <Flex basis={`${100/3}%`}>
          <Flex container justifyContent="center">
            <h3 className="secondary"><i className="fas fa-arrow-right"/></h3>
          </Flex>
        </Flex>
        <Flex basis={`${100/3}%`}>
          <Flex container justifyContent="flex-end">
            <h3 className="secondary"><UserLink user={t.sender}/></h3>
          </Flex>
        </Flex>
      </Flex>

      {needsRecipientWallet && isRecipient && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Flex container wrap alignItems="center">
            <Flex grow="1" basis="100%">Recipient's Wallet</Flex>
            <Flex container grow="1" basis="100%" alignItems="center">
              <Select
                  options={makeWalletsPromise}
                  name="recipient_wallet_id"
                  transform={w => w.id}
                  faceTransform={w => w.private_key} />
              <button action="submit"><i className="fa fa-save" /></button>
            </Flex>
          </Flex>
        </FormGroup>
      </Form>}

      {needsSenderWallet && isSender && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Flex container wrap alignItems="center">
            <Flex grow="1" basis="100%">Sender's Wallet</Flex>
            <Flex container grow="1" basis="100%" alignItems="center">
              <Select
                  options={makeWalletsPromise}
                  name="sender_wallet_id"
                  transform={w => w.id}
                  faceTransform={w => w.private_key} />
              <button action="submit"><i className="fa fa-save" /></button>
            </Flex>
          </Flex>
        </FormGroup>
      </Form>}
    </div>
  );
}

function TransactionRequirements({ collectionView }) {
  let rs = collectionView.getElements();

  if (rs.length === 0) return null;

  return (
    <XOverflowable>
      <Table striped horizontal>
        <thead className="no-select">
          <tr>
            <th>Requirement</th>
            <th>User</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rs.map(r => {
            return <tr key={r.id}>
                     <td>{r.text}</td>
                     <td><UserLink user={r.user} /></td>
                     <td>{r.fulfilled ? <GreenCheck /> : r.rejected ? <RedX /> : null}</td>
                   </tr>;
          })}
        </tbody>
      </Table>
    </XOverflowable>
  );
}

function TransactionDetail({ matches }) {
  return (
    <SideMargins>
      <ElementView collection={API.transaction} elementID={matches.id}>
        <TransactionInfo />
      </ElementView>
      <CollectionView collection={API.requirement.withParams({transaction__id: matches.id})}>
        <TransactionRequirements />
      </CollectionView>
    </SideMargins>
  );
}

export default TransactionDetail;
