import { getShelfIngredients } from '../data/ingredients';
import { calculateCauldron } from '../logic/calculate-cauldron';
import {
  addIngredient,
  brew,
  canBrew,
  createMenuState,
  getSettings,
  isCauldronFull,
  startGame,
} from '../state/game-state';
import type { IDifficultySettings, IGameState } from '../types/game';
import { BarsView } from './bars';
import { CauldronView } from './cauldron';
import { createButton, createElement } from './dom';
import type { IGameLayout } from './layout';
import { createGameLayout } from './layout';
import { RecipePanelView } from './recipe-panel';
import { ShelfView } from './shelf';

export class GameApp {
  private state: IGameState = createMenuState();

  private readonly layout: IGameLayout = createGameLayout();

  private readonly shelf: ShelfView;

  private readonly cauldron: CauldronView;

  private readonly recipe: RecipePanelView;

  private readonly bars: BarsView;

  private readonly brewMessage: HTMLParagraphElement;

  private readonly startButton: HTMLButtonElement;

  private readonly brewButton: HTMLButtonElement;

  public constructor(root: HTMLElement) {
    this.shelf = new ShelfView(this.layout.shelf, (id: string) => {
      this.handleAddIngredient(id);
    });
    this.cauldron = new CauldronView(this.layout.cauldron);
    this.recipe = new RecipePanelView(this.layout.recipe);
    this.bars = new BarsView(this.layout.bars);

    this.brewMessage = createElement('p', {
      className: 'brew-message',
      attributes: { 'aria-live': 'polite' },
    });
    this.layout.cauldron.append(this.brewMessage);

    this.startButton = createButton('Start Game', 'button button--primary button--large', () => {
      this.startNewGame();
    });
    this.brewButton = createButton('Brew', 'button button--primary button--large', () => {
      this.handleBrew();
    });
    this.layout.centerAction.append(this.startButton, this.brewButton);

    root.replaceChildren(this.layout.root);
    this.render();
  }

  private startNewGame(): void {
    this.state = startGame(this.state.difficulty);
    this.render();
  }

  private handleAddIngredient(id: string): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.setState(addIngredient(this.state, id));
  }

  private handleBrew(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.setState(brew(this.state));
  }

  private setState(next: IGameState): void {
    if (next === this.state) {
      return;
    }

    this.state = next;
    this.render();
  }

  private render(): void {
    const { state } = this;
    const settings: IDifficultySettings = getSettings(state);
    const isMenu: boolean = state.status === 'menu';

    this.layout.root.dataset.status = state.status;

    this.shelf.render({
      ingredients: isMenu ? [] : getShelfIngredients(settings.shelfSize),
      stock: state.shelfStock,
      isBlocked: state.status !== 'playing' || isCauldronFull(state),
    });

    this.cauldron.render({
      ingredients: state.cauldronIngredients,
      capacity: isMenu ? 0 : settings.maxCauldronIngredients,
    });

    this.recipe.render({
      recipe: state.activeRecipe,
      added: state.cauldronIngredients.length,
      capacity: settings.maxCauldronIngredients,
      tolerance: settings.tolerance,
    });

    this.bars.render({
      values: calculateCauldron(state.cauldronIngredients),
      recipe: state.activeRecipe,
      tolerance: settings.tolerance,
    });

    this.renderBrewMessage(settings);

    this.startButton.hidden = !isMenu;
    this.brewButton.hidden = isMenu;
    this.brewButton.disabled = !canBrew(state);
  }

  private renderBrewMessage(settings: IDifficultySettings): void {
    const result: IGameState['lastBrewResult'] = this.state.lastBrewResult;

    this.brewMessage.className = 'brew-message';

    if (result === 'success') {
      this.brewMessage.classList.add('brew-message--success');
      this.brewMessage.textContent = `Potion brewed! +${String(settings.scorePerBrew)} score, +${String(settings.timeBonusSeconds)} s. A new recipe is ready.`;

      return;
    }

    if (result === 'failure') {
      this.brewMessage.classList.add('brew-message--failure');
      this.brewMessage.textContent = 'Wrong mixture! You lost 1 life.';

      return;
    }

    this.brewMessage.textContent = '';
  }
}
