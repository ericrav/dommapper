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
    position: fixed;
    width: 10px;
    height: 10px;
    background: red;
    border: 1px solid white;
    border-radius: 50%;
    cursor: move;
    z-index: 100;
    transform: translate(-50%, -50%);
  }

  .dommapper__handle:hover, .dommapper__handle--active {
    background: blue;
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
    handleMap.set(handle, { item: { element, points, key: storageKey }, index: i });
    handle.addEventListener('mousedown', (e) => {
      state.dragging = true;
      document.querySelectorAll('.dommapper__handle--active').forEach((h) => {
        h.classList.remove('dommapper__handle--active');
      });
      handle.classList.add('dommapper__handle--active');
    });
  }

  element.style.position = 'fixed';
  element.style.left = '0';
  element.style.top = '0';
  element.style.transformOrigin = '0 0';
  element.style.transformStyle = 'preserve-3d';
  update3dTransform(element, points);
}

document.addEventListener('mousemove', (e) => {
  const activeHandle = document.querySelector('.dommapper__handle--active') as HTMLElement;
  if (!state.dragging || !activeHandle) {
    return;
  }
  const { item, index } = handleMap.get(activeHandle)!;
  const x = e.pageX;
  const y = e.pageY;
  item.points[index] = x;
  item.points[index + 1] = y;
  activeHandle.style.left = `${x}px`;
  activeHandle.style.top = `${y}px`;
  update3dTransform(item.element, item.points);
});

document.addEventListener('mouseup', () => {
  state.dragging = false;
});


function update3dTransform(element: HTMLElement, points: Box) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const matrix = projectToMatrix(width, height, ...points);
  element.style.transform = `matrix3d(${matrix.join(',')})`;
}

dommapper.hideHandles = () => {
  state.handlesVisible = false;
}

dommapper.showHandles = () => {
  state.handlesVisible = true;
}

export default dommapper;
