# html-sphere

Interactive rotating sphere in HTML, CSS, and JavaScript - check the [live demo right here](https://tz-dev.github.io/html-sphere/).

![Screenshot](img/screenshot.png)

## Features

- Interactive rotating sphere rendered on `<canvas>`
- Adjustable rotation speed
- Weighted X / Y / Z axis controls
- Mouse drag to rotate the sphere
- Right-click drag to rotate the view
- Mouse wheel and slider zoom
- Optional compass widget
- Adjustable horizontal and vertical line count
- Adjustable star density
- Optional glow
- Optional counter-rotating background stars
- Auto-hiding overlay and cursor after inactivity
- Fullscreen mode

## Controls

- **Left drag on sphere**: rotate the sphere manually
- **Right drag on background**: rotate the view
- **Mouse wheel**: zoom in / out
- **Double click on sphere**: reset sphere orientation
- **Pause**: pause automatic motion
- **Reset Sphere**: reset only the sphere rotation
- **Reset View**: reset the full scene

## Tech

- HTML
- CSS
- Vanilla JavaScript
- Canvas 2D

## Project structure

```text
html-sphere/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── img/
    └── screenshot.png
````

## Run locally

Just open `index.html` in a browser.

For development, using a local server is recommended.

Example with VS Code Live Server or any simple static file server.

## Notes

This project is a lightweight interactive graphics demo built without external libraries.

The sphere rotation, background stars, compass, glow, and UI are all handled in plain JavaScript and CSS.

## License

GNU General Public License v3.0
