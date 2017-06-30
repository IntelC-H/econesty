// Polyfills
import 'whatwg-fetch';

// App
import 'style/main'; // import our SCSS
import App from 'app/main'; // import our JavaScript

import ReactDOM from 'react-dom';

var body = document.getElementsByTagName("body")[0];
var container = document.createElement("div");
body.appendChild(container);

ReactDOM.render(App, container);
