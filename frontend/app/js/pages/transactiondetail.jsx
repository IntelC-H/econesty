import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { GreenCheck, Warning, RedX, BTC, Table, Button, XOverflowable, SideMargins } from 'base/components/elements';
import { API, FlexContainer, Link, CollectionView, ElementView,
         Form, FormGroup, Select, Input, FlexItem } from 'base/base';

function makeWalletsPromise() {
  return API.wallet.withParams({ user__id: API.getUserID() }).listAll();
}

function UserLink({ user }) {
  return (
    <Link
      className="userlink secondary"
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Link>
  );
}

function TransactionInfo({ elementView }) {
  let t = elementView.getElement();

  let needsRecipientWallet = t.recipient_wallet === null || t.recipient_wallet === undefined;
  let needsSenderWallet = t.sender_wallet === null || t.sender_wallet === undefined;
  let isSender = t.sender.id === API.getUserID();
  let isRecipient = t.recipient.id === API.getUserID();

  return (
    <div>
      <FlexContainer alignItems="center" direction="column">
        <FlexContainer alignItems="center" justifyContent="space-between">
          {t.completed
           ? t.success ? <GreenCheck component={'h1'} /> : <Warning component={'h1'} />
           : t.rejected ? <RedX component={'h1'} /> : null}
          <h1>Transaction #{t.id}</h1>
        </FlexContainer>
        {t.completed && !t.success &&
        <FlexContainer alignItems="center">
          <p>{t.error ? "Blockchain Error: " + t.error : ""}</p>
          <Button onClick={null}>Retry</Button>
        </FlexContainer>}
        <h3><BTC /> {parseFloat(t.amount)}</h3>
      </FlexContainer>
      <FlexContainer justifyContent="space-evenly">
        <h3 className="secondary"><UserLink user={t.recipient} /></h3>
        <h3 className="secondary"><i className="fas fa-arrow-right"/></h3>
        <h3 className="secondary"><UserLink user={t.sender}/></h3>
      </FlexContainer>

      {needsRecipientWallet && isRecipient && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <FlexContainer alignItems="center">
            <FlexItem grow="1">
              <label>Recipient's Wallet</label>
            </FlexItem>
            <FlexItem grow="2">
              <FlexContainer alignItems="center">
                <Select
                    options={makeWalletsPromise}
                    name="recipient_wallet_id"
                    transform={w => w.id}
                    faceTransform={w => w.private_key} />
                <Button action="submit"><i className="fa fa-save" /></Button>
              </FlexContainer>
            </FlexItem>
          </FlexContainer>
        </FormGroup>
      </Form>}

      {needsSenderWallet && isSender && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <FlexContainer alignItems="center">
            <FlexItem grow="1">
              <label>Sender's Wallet</label>
            </FlexItem>
            <FlexItem grow="2">
              <FlexContainer alignItems="center">
                <Select
                    options={makeWalletsPromise}
                    name="sender_wallet_id"
                    transform={w => w.id}
                    faceTransform={w => w.private_key} />
                <Button action="submit"><i className="fa fa-save" /></Button>
              </FlexContainer>
            </FlexItem>
          </FlexContainer>
        </FormGroup>
      </Form>}

    </div>
  );
}

function TransactionRequirements({ collectionView }) {
  let rs = collectionView.getElements();

  if (rs.count === 0) return null;

  return (
    <XOverflowable>
      <Table striped horizontal>
        <thead>
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
