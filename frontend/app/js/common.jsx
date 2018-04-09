import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Responsive, SVGIcon, doNotUpdate } from 'base/base';
import style from 'app/style';
import { noSelect } from 'base/style/mixins';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container row wrap alignItems="center" grow="1" margin>
      <Flex style={{ ...style.text.ellipsis, ...noSelect }}
            container justifyContent="flex-start" alignItems="center" basis="100%" paddingBottom>
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

function BTC({}) {
  return doNotUpdate(<SVGIcon viewBox="0 0 384 512" path="M310.204 242.638c27.73-14.18 45.377-39.39 41.28-81.3-5.358-57.351-52.458-76.573-114.85-81.929V0h-48.528v77.203c-12.605 0-25.525.315-38.444.63V0h-48.528v79.409c-17.842.539-38.622.276-97.37 0v51.678c38.314-.678 58.417-3.14 63.023 21.427v217.429c-2.925 19.492-18.524 16.685-53.255 16.071L3.765 443.68c88.481 0 97.37.315 97.37.315V512h48.528v-67.06c13.234.315 26.154.315 38.444.315V512h48.528v-68.005c81.299-4.412 135.647-24.894 142.895-101.467 5.671-61.446-23.32-88.862-69.326-99.89zM150.608 134.553c27.415 0 113.126-8.507 113.126 48.528 0 54.515-85.71 48.212-113.126 48.212v-96.74zm0 251.776V279.821c32.772 0 133.127-9.138 133.127 53.255-.001 60.186-100.355 53.253-133.127 53.253z"/>);
}

function Save({}) {
  return doNotUpdate(<SVGIcon viewBox="0 0 448 512" path="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z" />);
}

function Times({}) {
  return doNotUpdate(<SVGIcon viewBox="0 0 384 512" path="M231.6 256l130.1-130.1c4.7-4.7 4.7-12.3 0-17l-22.6-22.6c-4.7-4.7-12.3-4.7-17 0L192 216.4 61.9 86.3c-4.7-4.7-12.3-4.7-17 0l-22.6 22.6c-4.7 4.7-4.7 12.3 0 17L152.4 256 22.3 386.1c-4.7 4.7-4.7 12.3 0 17l22.6 22.6c4.7 4.7 12.3 4.7 17 0L192 295.6l130.1 130.1c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17L231.6 256z" />);
}

function Plus({}) {
  return doNotUpdate(<SVGIcon viewBox="0 0 448 512" path="M436 228H252V44c0-6.6-5.4-12-12-12h-32c-6.6 0-12 5.4-12 12v184H12c-6.6 0-12 5.4-12 12v32c0 6.6 5.4 12 12 12h184v184c0 6.6 5.4 12 12 12h32c6.6 0 12-5.4 12-12V284h184c6.6 0 12-5.4 12-12v-32c0-6.6-5.4-12-12-12z" />);
}

function Frown({ large, style, ...props }) {
  return <SVGIcon style={{ opacity: "0.4", fontSize: large ? "10rem" : "1rem",  ...style }}
                  viewBox="0 0 496 512" path="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-80 128c-40.2 0-78 17.7-103.8 48.6-8.5 10.2-7.1 25.3 3.1 33.8 10.2 8.5 25.3 7.1 33.8-3.1 16.6-19.9 41-31.4 66.9-31.4s50.3 11.4 66.9 31.4c4.8 5.7 11.6 8.6 18.5 8.6 5.4 0 10.9-1.8 15.4-5.6 10.2-8.5 11.5-23.6 3.1-33.8C326 321.7 288.2 304 248 304z" />;
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

export { FlexControlBlock, SideMargins, BTC, Save, Times, Plus, UserRow, XOverflowable, Frown };
