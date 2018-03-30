import App from 'app/app';
import Preact, { render } from 'preact';

require('preact/debug');

const {whyDidYouUpdate} = require('why-did-you-update');
whyDidYouUpdate(Preact);

render(App(), document.body);
