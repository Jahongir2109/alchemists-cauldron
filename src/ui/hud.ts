import { formatTime, MS_IN_SECOND } from '../logic/timer';
import { createElement } from './dom';
import { createIcon } from './icons';

export const DANGER_TIME_MS = 15 * MS_IN_SECOND;

export interface IHudViewState {
  score: number;
  timeLeft: number;
  startTime: number;
  lives: number;
}

export class HudView {
  private readonly score: HTMLSpanElement;

  private readonly time: HTMLSpanElement;

  private readonly timer: HTMLDivElement;

  private readonly timeBar: HTMLDivElement;

  private readonly lives: HTMLUListElement;

  private shownLives = -1;

  public constructor(container: HTMLElement) {
    this.score = createElement('span', { className: 'hud__value', text: '0' });
    this.time = createElement('span', { className: 'hud__value', text: '00:00' });
    this.timeBar = createElement('div', { className: 'hud__time-fill' });
    this.timer = createElement('div', { className: 'hud__timer', attributes: { role: 'timer' } }, [
      createElement('div', { className: 'hud__timer-row' }, [
        createElement('span', { className: 'hud__label', text: 'Time:' }),
        this.time,
      ]),
      createElement('div', { className: 'hud__time-bar', attributes: { 'aria-hidden': 'true' } }, [
        this.timeBar,
      ]),
    ]);
    this.lives = createElement('ul', { className: 'hud__lives' });

    container.prepend(
      createElement('div', { className: 'hud__bar' }, [
        createElement('div', { className: 'hud__score' }, [
          createElement('span', { className: 'hud__label', text: 'Score:' }),
          this.score,
        ]),
        this.timer,
        this.lives,
      ]),
    );
  }

  public render(view: IHudViewState): void {
    this.score.textContent = String(view.score);
    this.renderTime(view.timeLeft, view.startTime);
    this.renderLives(view.lives);
  }

  public renderTime(timeLeft: number, startTime: number): void {
    const ratio: number = startTime > 0 ? Math.min(1, timeLeft / startTime) : 0;
    const label: string = formatTime(timeLeft);

    if (this.time.textContent !== label) {
      this.time.textContent = label;
    }

    this.timeBar.style.transform = `scaleX(${String(ratio)})`;
    this.timer.classList.toggle('is-danger', timeLeft > 0 && timeLeft < DANGER_TIME_MS);
  }

  private renderLives(lives: number): void {
    if (lives === this.shownLives) {
      return;
    }

    this.shownLives = lives;
    this.lives.setAttribute('aria-label', `Lives: ${String(lives)}`);
    this.lives.replaceChildren(
      ...Array.from({ length: lives }, () =>
        createElement('li', { className: 'hud__life' }, [createIcon('heart', 'hud__heart')]),
      ),
    );
  }
}
