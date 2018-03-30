import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Responsive, inheritClass } from 'base/base';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container row wrap alignItems="center" grow="1" marginTop marginBottom>
      <Flex container className="ellipsis-text no-select" justifyContent="flex-start" alignItems="center" basis="100%" marginBottom>
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

function UserRow({ element }) {
  return (
    <Flex container alignItems="center">
      <Flex component='img' src={element.avatar_url} className="circular"
            marginRight width="1rem" height="1rem" />
      <div>{element.username}</div>
    </Flex>
  );
}

export { FlexControlBlock, SideMargins, BTC, RedX, GreenCheck, Warning, UserRow };
