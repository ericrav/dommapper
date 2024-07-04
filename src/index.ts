import { projectToMatrix } from "./matrix";
import { Store } from "./store";

export interface DomMapperOptions {
  /** Storage key used to save/retrieve projection points */
  key?: string;
  /**
   * Array of 8 numbers to set initial x,y coordinates of projection points,
   * starting from top-left, continuing clockwise
   */
  initialPoints?: [];
}

export type Point = [number, number];
export type Box = [...Point, ...Point, ...Point, ...Point];

interface Item {
  el: HTMLElement;
  points: HTMLElement[];
}

const state = {
  dragging: false,
  dragStart: [0, 0] as [number, number],
  handlesVisible: true,
}

function getStartingPoints(element: Element): Box {
  const rect = element.getBoundingClientRect();
  return [
    rect.left, rect.top,
    rect.right, rect.top,
    rect.left, rect.bottom,
    rect.right, rect.bottom,
  ];
}

const stylesheet = /* css */`
  .dommapper__handle {
    user-select: auto;
    position: fixed;
    width: 10px;
    height: 10px;
    background: red;
    border: 1px solid white;
    border-radius: 50%;
    cursor: move;
    z-index: 99999;
    transform: translate(-50%, -50%);
  }

  .dommapper__handle:hover, .dommapper__handle--active {
    background: blue;
    z-index: 999999;
  }

  .dommapper__handles-hidden .dommapper__handle {
    display: none;
  }

  .dommapper__dragging * {
    user-select: none;
  }
`;

const style = document.createElement('style');
style.textContent = stylesheet;
document.head.appendChild(style);

interface RegisteredElement {
  element: HTMLElement;
  points: Box;
  key: string;
}

const handleMap = new Map<Element, { item: RegisteredElement, index: number }>();

function dommapper(element: HTMLElement, options: DomMapperOptions = {}) {
  const storageKey = options.key || element.id || element.tagName;

  const existingPoints = Store.getPoints(storageKey);
  const points = (existingPoints as Box) || options.initialPoints || getStartingPoints(element);

  const item: RegisteredElement = { element, points, key: storageKey };

  for (let i = 0; i < 8; i += 2) {
    const handle = document.createElement('div');
    handle.classList.add('dommapper__handle');
    handle.style.left = `${points[i]}px`;
    handle.style.top = `${points[i + 1]}px`;
    document.body.appendChild(handle);
    handleMap.set(handle, { item, index: i });
    handle.addEventListener('mousedown', (e) => {
      state.dragging = true;
      state.dragStart = [e.pageX, e.pageY];
      document.body.classList.add('dommapper__dragging');
      if (e.shiftKey || e.metaKey) {
        handle.classList.toggle('dommapper__handle--active');
      } else {
        document.querySelectorAll('.dommapper__handle--active').forEach((h) => {
          h.classList.remove('dommapper__handle--active');
        });
        handle.classList.add('dommapper__handle--active');
      }
    });
  }

  element.style.position = 'fixed';
  element.style.left = '0';
  element.style.top = '0';
  element.style.transformOrigin = '0 0';
  element.style.transformStyle = 'preserve-3d';
  update3dTransform(element, points);
}

function updateHandle(handle: HTMLElement, dx: number, dy: number) {
  const { item, index } = handleMap.get(handle)!;
  const x = item.points[index] + dx;
  const y = item.points[index + 1] + dy;
  handle.style.left = `${x}px`;
  handle.style.top = `${y}px`;
  item.points[index] = x;
  item.points[index + 1] = y;
  handle.style.left = `${x}px`;
  handle.style.top = `${y}px`;
  update3dTransform(item.element, item.points);
}

document.addEventListener('mousemove', (e) => {
  if (!state.dragging || !state.handlesVisible) {
    return;
  }

  const activeHandles = document.querySelectorAll('.dommapper__handle--active');
  const dx = e.pageX - state.dragStart[0];
  const dy = e.pageY - state.dragStart[1];
  state.dragStart = [e.pageX, e.pageY];
  activeHandles.forEach((h) => {
    updateHandle(h as HTMLElement, dx, dy);
  });
});

document.addEventListener('mouseup', () => {
  state.dragging = false;
  document.body.classList.remove('dommapper__dragging');
  storePoints();
});

function storePoints() {
  const elements = new Set<HTMLElement>();
  document.querySelectorAll('.dommapper__handle--active').forEach((h) => {
    const { item } = handleMap.get(h)!;
    if (!elements.has(item.element)) {
      Store.setPoints(item.key, item.points);
    }
    elements.add(item.element);
  });
}

document.addEventListener('keydown', (e) => {
  if (!state.handlesVisible) {
    return;
  }

  if (e.key === 'Escape') {
    document.querySelectorAll('.dommapper__handle--active').forEach((h) => {
      h.classList.remove('dommapper__handle--active');
    });
  }

  if (e.key === 'Tab') {
    const handles = Array.from(document.querySelectorAll('.dommapper__handle'));
    const activeIndex = handles.findIndex((h) => h.classList.contains('dommapper__handle--active'));
    const increment = e.shiftKey ? -1 : 1;
    const nextIndex = (activeIndex + increment) % handles.length;
    document.querySelectorAll('.dommapper__handle--active').forEach((h) => {
      h.classList.remove('dommapper__handle--active');
    });
    handles[nextIndex].classList.add('dommapper__handle--active');
  }

  const activeHandles = document.querySelectorAll('.dommapper__handle--active');

  const step = e.shiftKey ? 10 : 1;
  const deltas = {
    'ArrowUp': [0, -step] as [number, number],
    'ArrowDown': [0, step] as [number, number],
    'ArrowLeft': [-step, 0] as [number, number],
    'ArrowRight': [step, 0] as [number, number],
  }[e.key];

  if (deltas) {
    activeHandles.forEach((h) => updateHandle(h as HTMLElement, ...deltas));
    storePoints();
  }
});


function update3dTransform(element: HTMLElement, points: Box) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const matrix = projectToMatrix(width, height, ...points);
  element.style.transform = `matrix3d(${matrix.join(',')})`;
}

dommapper.hideHandles = () => {
  state.handlesVisible = false;
  document.body.classList.add('dommapper__handles-hidden');
}

dommapper.showHandles = () => {
  state.handlesVisible = true;
  document.body.classList.remove('dommapper__handles-hidden');
}

dommapper.toggleHandles = () => {
  if (state.handlesVisible) {
    dommapper.hideHandles();
  } else {
    dommapper.showHandles();
  }
}

export default dommapper;
