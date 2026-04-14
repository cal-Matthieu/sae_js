import { JSDOM } from 'jsdom';
const { window } = new JSDOM(``, { url: 'http://localhost' });
(global as any).Image = window.Image;

//lancer les tests
//node --test --require ./src/test/setup.ts
