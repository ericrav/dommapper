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
  dragging: null as null | { item: Item, index: number },
  handlesVisible: true,
}

function getStartingPoints(element: Element): Box {
  const rect = element.getBoundingClientRect();
  return [
    rect.left, rect.top,
    rect.right, rect.top,
    rect.right, rect.bottom,
    rect.left, rect.bottom,
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

  .dommapper__handle::hover {
    background: blue;
  }
`;

const style = document.createElement('style');
style.textContent = stylesheet;
document.head.appendChild(style);

function dommapper(element: Element, options: DomMapperOptions = {}) {
  const storageKey = options.key || element.id || element.tagName;

  const existingPoints = Store.getPoints(storageKey);
  const points = existingPoints || options.initialPoints || getStartingPoints(element);

  for (let i = 0; i < 8; i += 2) {
    const handle = document.createElement('div');
    handle.classList.add('dommapper__handle');
    handle.style.left = `${points[i]}px`;
    handle.style.top = `${points[i + 1]}px`;
    document.body.appendChild(handle);
    handle.addEventListener('mousedown', (e) => {
      // state.dragging = { item: items[el.id], index: i };
    });
    // points.push(handle);
  }
}

dommapper.hideHandles = () => {
  state.handlesVisible = false;
}

dommapper.showHandles = () => {
  state.handlesVisible = true;
}

export default dommapper;
