//import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

// Svelte 5
//const app = mount(App, {
//  target: document.getElementById('app')!,
//})
const app = new App({ target: document.getElementById('app') });
//app.$on('event', callback);

export default app;
