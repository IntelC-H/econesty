import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Button } from './button';

function Anchor({ style, hoverStyle, ...props }) {
  return <Button style={{ display: "inline", ...style }} // stop worrying about <a> tag :hover, :visited, etc...
                 hoverStyle={{ textDecoration: "underline", ...hoverStyle }}
                 disableBaseStyles
                 {...props} />;
}

Anchor.defaultProps = {
  component: 'a'
};

export { Anchor };
export default Anchor;
