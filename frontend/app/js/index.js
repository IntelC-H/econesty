import App from 'app/app';
import Preact, { h, render } from 'preact';

require('preact/debug');

const {whyDidYouUpdate} = require('why-did-you-update');
whyDidYouUpdate(Preact);

let externalStylesheets = [
  '//fonts.googleapis.com/css?family=Hammersmith+One|Inconsolata|Lato|Sacramento',
  '//use.fontawesome.com/releases/v5.0.8/css/all.css'
];

for (let href of externalStylesheets) {
  render(h('link', { rel: "stylesheet", type: "text/css", href: href }), document.head);
}

render(App(), document.body);
