import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Responsive, inheritClass, cssSubclass } from 'base/base';
import style from 'app/style';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container row wrap alignItems="center" grow="1" marginTop marginBottom>
      <Flex className="no-select" style={style.text.ellipsis}
            container justifyContent="flex-start" alignItems="center" basis="100%" marginBottom>
        {label}
      </Flex>
      <Flex container justifyContent="flex-start" alignItems="center" basis="100%">
        {children}
      </Flex>
    </Flex>
  );
}

const SideMargins = ({ children, ...props }) =>
  <Responsive>
    { ({ sm }) => {
      props.basis = sm ? `${100 * (2/3)}%` : undefined;
      return (
        <Flex container justifyContent="center">
          <Flex {...props}>
            {children}
          </Flex>
        </Flex>
      );
    }}
  </Responsive>;

const BTC = inheritClass("span", "fab fa-btc");

const RedX = ({ component }) => h(component || 'span', { style: {color: "red"}, className:"fas fa-times icon" });
const GreenCheck = ({ component }) => h(component || 'span', { style: {color: "green"}, className:"fas fa-check icon" });
const Warning = ({ component }) => h(component || 'span', { style: {color: "orange"}, className:"fas fa-exclamation-triangle icon" });

function Frown({ medium, large, style, ...props }) {
  return <span {...props}
               className="far fa-frown"
               style={{ ...style, opacity: "0.4", fontSize: (large ? "10rem" : "1rem")}} />;
}

function UserRow({ element }) {
  return (
    <Flex container alignItems="center">
      <Flex component='img' src={element.avatar_url} style={style.shape.circular}
            marginRight width="1rem" height="1rem" />
      <div>{element.username}</div>
    </Flex>
  );
}

function XOverflowable({ style, ...props }) {
  return <div {...props} style={{ ...style, overflowX: "auto" }}/>;
}

export { FlexControlBlock, SideMargins, BTC, RedX, GreenCheck, Warning, UserRow, XOverflowable, Frown };
