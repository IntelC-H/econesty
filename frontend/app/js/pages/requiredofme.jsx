import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { connect } from 'preact-redux';
import { Anchor, Flex, Form, Input, FadeTransition, Loading, API, Button } from 'base/base';
import { SideMargins, Frown, LeftArrow, RightArrow, PageSeekControls } from 'app/common';
import style from 'app/style';
import BaseStyle from 'base/style';
import { noSelect } from 'base/style/mixins';
import { reloadRequirements, saveRequirement } from 'app/redux/actionCreators';

const rsStyle = {
  pageTitle: {
    ...noSelect(),
    ...style.text.primary,
    padding: `${BaseStyle.padding} 0`
  },
  reqTitle: {
    ...noSelect(),
    ...style.text.secondary,
    padding: `${BaseStyle.padding} 0`
  },
  signature: {
    ...style.text.script,
    padding: `${BaseStyle.padding} 0`
  },
  terms: {
    padding: `${BaseStyle.padding} 0`
  },
  signatureField: {
    margin: BaseStyle.padding,
    flexGrow: "2"
  }
};

function RequirementsCollection({ requirements, save }) {
  if (requirements.length === 0) {
    return (
      <div style={style.element.frownMessage}>
        <Frown large />
        <p style={noSelect()}>You don't have any requirements!</p>
      </div>
    );
  }
  return (
    <Flex container column style={style.table.base}>
      {requirements.map((element, idx) =>
        <Flex container column style={{...style.table.row, ...idx % 2 ? style.table.oddRow : {}, ...style.table.column}}>
          <Flex container row alignItems="center">
            <p style={{ ...rsStyle.reqTitle, color: element.rejected ? "red" : element.fulfilled ? "green" : null }}>
              Transaction <Anchor style={style.text.secondary} href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Anchor>
            </p>
          </Flex>
          <Flex container wrap justifyContent="space-between" alignItems="center">
            <Flex basis="auto">
              <p style={rsStyle.terms}>{Boolean(element.text) ? element.text : "No written terms."}</p>
              {element.fulfilled && <p style={rsStyle.signature}>{element.signature}</p>}
            </Flex>
            {!element.acknowledged &&
            <Button onClick={() => save({ id: element.id, acknowledged: true})}>Acknowledge</Button>}
            {element.acknowledged && !element.rejected && !element.fulfilled && 
            <Flex component={Form} onSubmit={save}
                  container row wrap alignItems="center" justifyContent="center">
              <Input hidden name="id" value={element.id} />
              <Input text placeholder="Sign/type your name" name="signature" value={element.signature} style={rsStyle.signatureField} />
              <Button type="submit">SIGN</Button>
              <Button onClick={() => save({ id: element.id, rejected: true, signature: null}) }>REJECT</Button>
            </Flex>}
          </Flex>
        </Flex>)}
    </Flex>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
    ...state.requirements
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    ...ownProps,
    reloadRequirements: (page) => dispatch(reloadRequirements(page)),
    saveRequirement: (r) => dispatch(saveRequirement(r))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(class RequiredOfMe extends Component {
  componentDidMount() {
    this.props.reloadRequirements(this.props.page || 1);
  }

  render() {
    const { error, loading, requirements, count, page, nextPage, previousPage, saveRequirement } = this.props;
    return (
      <SideMargins>
        <Flex container column alignItems="center" margin>
          <p style={rsStyle.pageTitle}>My Requirements</p>
        </Flex>
        <FadeTransition>
          {loading && <Loading fadeIn fadeOut key="loading" />}
          {!loading && error && <span fadeIn key="error">{error}</span>}
          {!loading && !error && requirements && <RequirementsCollection fadeIn key="requirements" requirements={requirements} save={saveRequirement} />}
          {!loading && !error && requirements &&
          <PageSeekControls
            fadeIn key="controls"
            previousPage={previousPage}
            nextPage={nextPage}
            page={page}
            count={count}
            setPage={this.props.reloadRequirements} />}
        </FadeTransition>
      </SideMargins>
    );
  }
});

