import App from 'app/main'; // import our JavaScript & JSX
import { render } from 'react-dom';

var body = document.getElementsByTagName("body")[0];
var container = document.createElement("div");
body.appendChild(container);

render(App(), container);
