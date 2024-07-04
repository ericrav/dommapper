<img src="dommapper.png">

# dom mapper

Projection mapping in the browser for any DOM element, including p5.js and three.js canvases.

This library applies the `matrix3d` CSS transform to map any DOM element to a projected surface for projector-based installations.

Transformations will be saved in local storage and re-applied on page load.

```js
import dommapper from 'dommapper';

const canvas = document.getElementById('canvas');
dommapper(canvas);

const iframe = document.getElementById('iframe');
dommapper(iframe);

document.addEventListener('keypress', (event) => {
  if (event.key === 'h') {
    dommapper.toggleHandles(); // Show/hide handles when done mapping
  }
});
```

- Call `dommapper` on any HTML Element
- Drag the corners to map the element to the projected surface
- Shift-click corners to move multiple at once
- Use arrow keys to fine tune selected corners

## Installation

Usage with `npm` and modules:

```
npm install dommapper
```

```js
import dommapper from 'dommapper';
```


## Usage

```js
dommapper(element, options);
```

- `element` - Must be an HTML element in the document
- `options` - Optional configuration

### Options

| Option | Description |
| --- | --- |
| `key` | `string` - Key used to save/load projection points. If omitted, element id or tag name will be used. |
| `initialPoints` | `number[]` - Array of 8 numbers to specify initial projection points. Defaults to element's bounding rect |

### Additional APIs

```js
// Show/hide all corner handles
dommapper.toggleHandles();
dommapper.showHandles();
dommapper.hideHandles();
```
