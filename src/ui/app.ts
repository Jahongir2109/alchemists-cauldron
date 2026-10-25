import { getShelfIngredients } from '../data/ingredients';
import { findReaction } from '../data/reactions';
import { addLeaderboardEntry, isTopScore, normalizePlayerName } from '../logic/leaderboard';
import { CountdownTimer, secondsToMs } from '../logic/timer';
import {
  addIngredient,
  brew,
  canBrew,
  canPourOut,
  createMenuState,
  getCauldronValues,
  getSettings,
  isCauldronFull,
  pauseGame,
  POUR_OUT_PENALTY_SECONDS,
  pourOut,
  restoreGame,
  resumeGame,
  selectDifficulty,
  startGame,
  updateTimeLeft,
} from '../state/game-state';
import { loadLeaderboard, saveLeaderboard } from '../storage/leaderboard';
import { clearSave, loadGame, saveGame } from '../storage/save';
import type { ISavedGame } from '../storage/save';
import type {
  BrewResult,
  Difficulty,
  GameStatus,
  IDifficultySettings,
  IGameState,
  IIngredient,
  ILeaderboardEntry,
  IReaction,
} from '../types/game';
import { BarsView } from './bars';
import { CauldronView } from './cauldron';
import { createButton, createElement, replayAnimation } from './dom';
import { GameOverView } from './game-over';
import { HelpView } from './help';
import { HudView } from './hud';
import type { IGameLayout } from './layout';
import { createGameLayout } from './layout';
import { listenToShortcuts } from './keyboard';
import { LeaderboardView } from './leaderboard';
import { MenuView } from './menu';
import { PauseView } from './pause';
import { RecipePanelView } from './recipe-panel';
import { ShelfView } from './shelf';

export class GameApp {
  private state: IGameState;

  private readonly timer: CountdownTimer = new CountdownTimer();

  private frameId: number | null = null;

  private readonly layout: IGameLayout = createGameLayout();

  private readonly hud: HudView;

  private readonly shelf: ShelfView;

  private readonly cauldron: CauldronView;

  private readonly recipe: RecipePanelView;

  private readonly bars: BarsView;

  private readonly gameOver: GameOverView;

  private readonly pause: PauseView;

  private readonly pauseButton: HTMLButtonElement;

  private readonly leaderboard: LeaderboardView = new LeaderboardView();

  private readonly menu: MenuView;

  private readonly menuButton: HTMLButtonElement;

  private readonly help: HelpView = new HelpView();

  private readonly helpButton: HTMLButtonElement;

  private finishedAt = 0;

  private readonly brewMessage: HTMLParagraphElement;

  private readonly startButton: HTMLButtonElement;

  private readonly brewButton: HTMLButtonElement;

  private readonly continueButton: HTMLButtonElement;

  private readonly pourOutButton: HTMLButtonElement;

  private hasSave: boolean;

  public constructor(root: HTMLElement) {
    const saved: ISavedGame | null = loadGame();

    this.state = createMenuState(saved?.difficulty);
    this.hasSave = saved !== null;
    this.hud = new HudView(this.layout.header);
    this.shelf = new ShelfView(this.layout.shelf, (id: string) => {
      this.handleAddIngredient(id);
    });
    this.cauldron = new CauldronView(this.layout.cauldron, {
      canDrop: (): boolean => this.state.status === 'playing' && !isCauldronFull(this.state),
      onDrop: (id: string): void => {
        this.handleAddIngredient(id);
      },
    });
    this.recipe = new RecipePanelView(this.layout.recipe);
    this.bars = new BarsView(this.layout.bars);
    this.gameOver = new GameOverView({
      onPlayAgain: (): void => {
        this.startNewGame();
      },
      onExitToMenu: (): void => {
        this.exitToMenu();
      },
      onOpenLeaderboard: (): void => {
        this.leaderboard.show(this.state.difficulty);
      },
      onSubmitScore: (name: string): boolean => this.submitScore(name),
    });

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
    this.continueButton = createButton('Continue Game', 'button button--large', () => {
      this.continueGame();
    });
    this.pourOutButton = createButton(
      `Pour Out (−${String(POUR_OUT_PENALTY_SECONDS)} s)`,
      'button button--large button--secondary',
      () => {
        this.handlePourOut();
      },
    );
    this.layout.centerAction.append(
      this.startButton,
      this.continueButton,
      this.brewButton,
      this.pourOutButton,
    );

    this.pause = new PauseView({
      onResume: (): void => {
        this.resume();
      },
      onExitToMenu: (): void => {
        this.exitToMenu();
      },
    });
    this.pauseButton = createButton('Pause', 'button', () => {
      this.pauseRun();
    });
    this.menu = new MenuView({
      onSelectDifficulty: (difficulty: Difficulty): void => {
        this.setState(selectDifficulty(this.state, difficulty));
      },
      onContinue: (): void => {
        this.continueGame();
      },
      onNewGame: (): void => {
        this.startNewGame();
      },
      onOpenLeaderboard: (): void => {
        this.leaderboard.show(this.state.difficulty);
      },
    });
    this.menuButton = createButton('Menu', 'button', () => {
      this.menu.show(this.state.difficulty, this.hasSave);
    });
    this.layout.controlsRight.append(this.pauseButton, this.menuButton);

    this.helpButton = createButton('Help', 'button', () => {
      this.help.show(this.state.difficulty);
    });
    this.layout.controlsLeft.append(this.helpButton);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseRun();
      }
    });

    listenToShortcuts({
      getStatus: (): GameStatus => this.state.status,
      onAddIngredient: (shelfIndex: number): void => {
        const ingredient: IIngredient | undefined = getShelfIngredients(
          getSettings(this.state).shelfSize,
        )[shelfIndex];

        if (ingredient) {
          this.handleAddIngredient(ingredient.id);
        }
      },
      onBrew: (): void => {
        this.handleBrew();
      },
      onPourOut: (): void => {
        this.handlePourOut();
      },
      onPause: (): void => {
        this.pauseRun();
      },
    });
    this.brewButton.setAttribute('aria-keyshortcuts', 'B');
    this.pourOutButton.setAttribute('aria-keyshortcuts', 'O');
    this.pauseButton.setAttribute('aria-keyshortcuts', 'P Escape');

    // Reload or close: keep the exact remaining time in the save.
    window.addEventListener('pagehide', () => {
      if (this.state.status === 'playing') {
        this.state = this.syncTime();
        this.persist();
      }
    });

    root.replaceChildren(this.layout.root);
    this.render();
  }

  private startNewGame(): void {
    this.closeDialogs();
    this.setState(startGame(this.state.difficulty));
  }

  private exitToMenu(): void {
    this.closeDialogs();
    clearSave();
    this.hasSave = false;
    this.setState(createMenuState(this.state.difficulty));
  }

  private closeDialogs(): void {
    this.gameOver.hide();
    this.pause.hide();
    this.menu.hide();
    this.help.hide();
  }

  private submitScore(name: string): boolean {
    const entry: ILeaderboardEntry = {
      name: normalizePlayerName(name),
      score: this.state.score,
      date: this.finishedAt,
      difficulty: this.state.difficulty,
    };
    const isSaved: boolean = saveLeaderboard(addLeaderboardEntry(loadLeaderboard(), entry));

    if (isSaved) {
      this.leaderboard.show(entry.difficulty, entry);
    }

    return isSaved;
  }

  private pauseRun(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.setState(pauseGame(this.syncTime()));
    this.pause.show();
  }

  private resume(): void {
    this.pause.hide();
    this.setState(resumeGame(this.state));
  }

  private handleAddIngredient(id: string): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.setState(addIngredient(this.syncTime(), id));
  }

  private handleBrew(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    const next: IGameState = brew(this.syncTime());

    this.setState(next);

    if (next.lastBrewResult) {
      this.playBrewFeedback(next.lastBrewResult);
    }
  }

  private playBrewFeedback(result: BrewResult): void {
    this.cauldron.playEffect(result);

    if (result === 'failure') {
      replayAnimation(this.layout.root, 'is-shaking');

      return;
    }

    // Optional floating "+10s"; it removes itself when its CSS animation ends.
    const bonus: HTMLSpanElement = createElement('span', {
      className: 'float-text',
      text: `+${String(getSettings(this.state).timeBonusSeconds)}s`,
      attributes: { 'aria-hidden': 'true' },
    });

    bonus.addEventListener('animationend', () => {
      bonus.remove();
    });
    this.layout.cauldron.append(bonus);
  }

  private handlePourOut(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.setState(pourOut(this.syncTime()));
  }

  // Copies the timestamp-based remaining time into the state before an action changes it.
  private syncTime(): IGameState {
    return this.timer.isRunning()
      ? updateTimeLeft(this.state, this.timer.getTimeLeft())
      : this.state;
  }

  private continueGame(): void {
    const saved: ISavedGame | null = loadGame();

    this.closeDialogs();

    if (!saved) {
      this.hasSave = false;
      this.render();

      return;
    }

    this.setState(restoreGame(saved));
    this.pause.show();
  }

  // Auto-save: every change of a running or paused game is saved, a finished game never is.
  private persist(): void {
    if (this.state.status === 'playing' || this.state.status === 'paused') {
      this.hasSave = saveGame(this.state);

      return;
    }

    if (this.state.status === 'game-over') {
      clearSave();
      this.hasSave = false;
    }
  }

  private setState(next: IGameState): void {
    if (next === this.state) {
      return;
    }

    const previous: IGameState = this.state;

    this.state = next;
    this.syncTimer();
    this.persist();
    this.render();

    if (previous.status !== 'game-over' && next.status === 'game-over') {
      this.finishedAt = Date.now();
      this.gameOver.show({
        score: next.score,
        reason: next.gameOverReason,
        isTopScore: isTopScore(loadLeaderboard(), next.score, next.difficulty),
      });
    }
  }

  private syncTimer(): void {
    if (this.state.status === 'playing') {
      this.timer.start(this.state.timeLeft);
      this.requestFrame();

      return;
    }

    this.timer.stop();
    this.cancelFrame();
  }

  private requestFrame(): void {
    this.frameId ??= requestAnimationFrame(() => {
      this.frameId = null;
      this.tick();
    });
  }

  private cancelFrame(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private tick(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    const timeLeft: number = this.timer.getTimeLeft();

    if (timeLeft <= 0) {
      this.setState(updateTimeLeft(this.state, 0));

      return;
    }

    this.state = { ...this.state, timeLeft };
    this.hud.renderTime(timeLeft, secondsToMs(getSettings(this.state).startTimeSeconds));
    this.requestFrame();
  }

  private render(): void {
    const { state } = this;
    const settings: IDifficultySettings = getSettings(state);
    const isMenu: boolean = state.status === 'menu';

    this.layout.root.dataset.status = state.status;

    this.hud.render({
      score: state.score,
      timeLeft: state.timeLeft,
      startTime: secondsToMs(settings.startTimeSeconds),
      lives: state.lives,
    });

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
      difficulty: state.difficulty,
      added: state.cauldronIngredients.length,
      capacity: settings.maxCauldronIngredients,
      tolerance: settings.tolerance,
    });

    this.bars.render({
      values: getCauldronValues(state),
      recipe: state.activeRecipe,
      tolerance: settings.tolerance,
    });

    this.renderBrewMessage(settings);

    this.startButton.hidden = !isMenu;
    this.continueButton.hidden = !isMenu || !this.hasSave;
    this.brewButton.hidden = isMenu;
    this.brewButton.disabled = !canBrew(state);
    this.pourOutButton.hidden = isMenu;
    this.pourOutButton.disabled = !canPourOut(state);
    this.pauseButton.hidden = state.status !== 'playing' && state.status !== 'paused';
    this.pauseButton.disabled = state.status !== 'playing';
    this.menuButton.hidden = !isMenu;
    this.helpButton.hidden = !isMenu;
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

    const reaction: IReaction | undefined = findReaction(this.state.lastReactionId ?? '');

    if (reaction) {
      this.brewMessage.classList.add('brew-message--reaction');
      this.brewMessage.textContent = `Reaction: ${reaction.name}! ${reaction.description}`;

      return;
    }

    this.brewMessage.textContent = '';
  }
}
