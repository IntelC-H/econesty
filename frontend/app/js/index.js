import App from 'app/app';
import Preact, { h, render } from 'preact';

require('preact/debug');

const {whyDidYouUpdate} = require('why-did-you-update');
whyDidYouUpdate(Preact);

let externalStylesheets = [
  '//fonts.googleapis.com/css?family=Hammersmith+One|Inconsolata|Lato|Sacramento'
];

for (let href of externalStylesheets) {
  render(h('link', { rel: "stylesheet", type: "text/css", href: href }), document.head);
}

render(App(), document.body);
