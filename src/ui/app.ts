import { getShelfIngredients } from '../data/ingredients';
import {
  addIngredient,
  createMenuState,
  getSettings,
  isCauldronFull,
  startGame,
} from '../state/game-state';
import { calculateCauldron } from '../logic/calculate-cauldron';
import type { IDifficultySettings, IGameState } from '../types/game';
import { BarsView } from './bars';
import { CauldronView } from './cauldron';
import { createButton } from './dom';
import type { IGameLayout } from './layout';
import { createGameLayout } from './layout';
import { ShelfView } from './shelf';

export class GameApp {
  private state: IGameState = createMenuState();

  private readonly layout: IGameLayout = createGameLayout();

  private readonly shelf: ShelfView;

  private readonly cauldron: CauldronView;

  private readonly bars: BarsView;

  private readonly startButton: HTMLButtonElement;

  public constructor(root: HTMLElement) {
    this.shelf = new ShelfView(this.layout.shelf, (id: string) => {
      this.handleAddIngredient(id);
    });
    this.cauldron = new CauldronView(this.layout.cauldron);
    this.bars = new BarsView(this.layout.bars);

    this.startButton = createButton('Start Game', 'button button--primary button--large', () => {
      this.startNewGame();
    });
    this.layout.centerAction.append(this.startButton);

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

    this.bars.render({
      values: calculateCauldron(state.cauldronIngredients),
      recipe: state.activeRecipe,
      tolerance: settings.tolerance,
    });

    this.startButton.hidden = !isMenu;
  }
}
