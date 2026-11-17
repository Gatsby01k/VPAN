type Artwork = { decoded: boolean; ready: Promise<void> };

type PageTurn = {
  path: string;
  navigate: () => void;
  navigated: boolean;
  opening: boolean;
  panels: HTMLElement[];
  animations: Animation[];
  listeners: AbortController;
  watchdog: number;
};

const artwork = new Map<string, Artwork>();
let active: PageTurn | undefined;

const routePath = (path: string) => path.replace(/\/+$/, '') || '/';
const motionPreference = '(prefers-reduced-motion: reduce)';
const canMove = () => !document.hidden && !window.matchMedia(motionPreference).matches;
const publicRoute = (path: string) => !/^\/admin(?:\/|$)/i.test(path);

function decodeArtwork(source: string) {
  const cached = artwork.get(source);
  if (cached) return cached;

  const image = new Image();
  image.src = source;
  const entry: Artwork = {
    decoded: false,
    ready: image.decode().then(
      () => {
        entry.decoded = true;
      },
      (error: unknown) => {
        artwork.delete(source);
        throw error;
      },
    ),
  };
  artwork.set(source, entry);
  return entry;
}

function readyArtwork() {
  const pending: Promise<void>[] = [];
  for (const cover of document.querySelectorAll<HTMLElement | SVGElement>(
    '#main [data-page-art]',
  )) {
    const box = cover.getBoundingClientRect();
    const source = cover.dataset.pageArt;
    if (!source || !box.width || box.top >= innerHeight || box.bottom <= 0) continue;
    const entry = decodeArtwork(source);
    if (entry.decoded) continue;

    cover.setAttribute('data-art-pending', '');
    pending.push(
      entry.ready.then(
        () => cover.removeAttribute('data-art-pending'),
        () => cover.removeAttribute('data-art-pending'),
      ),
    );
  }
  return Promise.all([document.fonts.ready, ...pending]);
}

function clear(turn: PageTurn) {
  if (active !== turn) return;
  active = undefined;
  window.clearTimeout(turn.watchdog);
  turn.listeners.abort();
  delete document.documentElement.dataset.pageTurn;
  for (const animation of turn.animations) animation.cancel();
}

function navigate(turn: PageTurn) {
  if (active !== turn || turn.navigated) return;
  turn.navigated = true;
  document.documentElement.dataset.pageTurn = 'closed';
  turn.navigate();
}

function open(turn: PageTurn) {
  if (active !== turn || turn.opening) return;
  turn.opening = true;
  document.documentElement.dataset.pageTurn = 'opening';
  const animations = turn.panels.map((panel, index) =>
    panel.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${index === 0 ? '-101%' : '101%'})` },
      ],
      { duration: 350, easing: 'cubic-bezier(.44, 0, .20, 1)', fill: 'both' },
    ),
  );
  turn.animations.push(...animations);
  void Promise.all(animations.map((animation) => animation.finished)).then(
    () => clear(turn),
    () => {},
  );
}

export function startPageTurn(pathname: string, action: () => void) {
  const path = routePath(pathname);
  const from = routePath(location.pathname);
  const panels = [...document.querySelectorAll<HTMLElement>('.page-turn-panel')];
  if (
    !canMove() ||
    !publicRoute(from) ||
    !publicRoute(path) ||
    from === path ||
    panels.length !== 2
  )
    return false;

  if (active) {
    const turn = active;
    turn.path = path;
    turn.navigate = action;
    if (turn.navigated) {
      clear(turn);
      action();
    }
    return true;
  }

  const root = document.documentElement;
  const turn: PageTurn = {
    path,
    navigate: action,
    navigated: false,
    opening: false,
    panels,
    animations: [],
    listeners: new AbortController(),
    watchdog: 0,
  };
  active = turn;
  root.dataset.pageTurn = 'closing';
  const { signal } = turn.listeners;
  const finish = () => {
    navigate(turn);
    clear(turn);
  };
  window.addEventListener('wheel', finish, { passive: true, signal });
  window.addEventListener('touchmove', finish, { passive: true, signal });
  window.addEventListener('resize', finish, { signal });
  window.addEventListener('popstate', () => clear(turn), { signal });
  window.matchMedia(motionPreference).addEventListener('change', finish, { signal });
  document.addEventListener('visibilitychange', finish, { signal });
  turn.watchdog = window.setTimeout(finish, 1000);

  const animations = panels.map((panel, index) =>
    panel.animate(
      [
        { transform: `translateX(${index === 0 ? '-101%' : '101%'})` },
        { transform: 'translateX(0)' },
      ],
      { duration: 150, easing: 'cubic-bezier(.36, 0, .25, 1)', fill: 'both' },
    ),
  );
  turn.animations.push(...animations);
  void Promise.all(animations.map((animation) => animation.finished)).then(
    () => navigate(turn),
    () => {},
  );
  return true;
}

export function completePageNavigation(from: string, pathname: string) {
  if (routePath(from) === routePath(pathname)) return;
  const turn = active;
  if (!turn) return;
  if (turn.path !== routePath(pathname) || !canMove()) {
    clear(turn);
    return;
  }

  // Reveal a committed page after the fonts and the visible artwork have settled.
  const timeout = window.setTimeout(() => open(turn), 240);
  void Promise.all([
    readyArtwork(),
    new Promise<void>((resolve) => window.setTimeout(resolve, 85)),
  ]).then(() => {
    window.clearTimeout(timeout);
    open(turn);
  });
}
