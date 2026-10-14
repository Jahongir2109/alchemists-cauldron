import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/shelf.css';
import './styles/cauldron.css';
import './styles/bars.css';
import './styles/recipe.css';
import './styles/hud.css';
import './styles/dialogs.css';
import { GameApp } from './ui/app';

const root: HTMLElement | null = document.querySelector('#app');

if (root) {
  new GameApp(root);
}
