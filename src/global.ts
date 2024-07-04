import dommapper from ".";

declare global {
  interface Window {
    dommapper: typeof dommapper;
  }
}

window.dommapper = dommapper;
