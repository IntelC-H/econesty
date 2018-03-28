import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Responsive, inheritClass } from 'base/base';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container direction="row" wrap="wrap" alignItems="center" grow="1" marginTop marginBottom>
      <Flex container className="ellipsis-text" justifyContent="flex-start" alignItems="center" basis="100%" marginBottom>
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
      if (!sm) return <div {...props}>{children}</div>;
      return (
        <Flex container justifyContent="center">
          <Flex basis={`${100 * (2/3)}%`} {...props}>
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

export { FlexControlBlock, SideMargins, BTC, RedX, GreenCheck, Warning };
