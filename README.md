# html-sphere

Interactive rotating sphere in HTML, CSS, and JavaScript — check the [live demo right here](https://tz-dev.github.io/html-sphere/).

![Screenshot](img/screenshot.png)

## Features

### Sphere and scene

* Interactive rotating sphere rendered on `<canvas>`
* Adjustable global rotation speed
* Weighted X / Y / Z axis controls
* Adjustable sphere color hue
* Adjustable horizontal line count
* Adjustable vertical line count
* Mouse wheel and slider zoom
* Optional planetary ring around the sphere
* Adjustable ring inner radius
* Adjustable ring outer radius
* Ring inner radius constrained logically to the sphere radius minimum
* Ring rotation synced with the sphere direction at half sphere speed

### Background and effects

* Adjustable star density
* Optional sphere glow
* Adjustable sphere glow intensity
* Optional star glow
* Adjustable star glow intensity
* Optional counter-rotating background stars
* Adjustable global scene brightness
* Adjustable global scene contrast
* Warp transition with camera movement
* Sphere drift during warp transitions
* Randomized hue, axis settings, speed, brightness, contrast, ring visibility, and ring size after warp

### Interface

* Optional compass widget
* Optional FPS display
* Star hover label
* Auto-warp mode with configurable interval
* Auto-hiding overlay and cursor after inactivity
* Fullscreen mode
* Fullscreen button state sync

## Controls

### Mouse interaction

* **Left drag on sphere**: rotate the sphere manually
* **Right drag on background**: rotate the view
* **Mouse wheel**: zoom in / out
* **Middle click on a star**: warp to the selected star
* **Double click on sphere**: reset sphere orientation

### Buttons and toggles

* **Pause**: pause automatic motion
* **Reset Sphere**: reset only the sphere rotation
* **Reset View**: reset the full scene
* **Fullscreen**: enter or leave fullscreen mode
* **Show FPS**: toggle the FPS display
* **Show compass**: toggle the compass widget
* **Sphere glow**: toggle sphere glow rendering
* **Star glow**: toggle star glow rendering
* **Counter-rotate**: toggle counter-rotating background stars
* **Show ring**: toggle ring rendering
* **Auto-warp**: automatically warp to random visible stars

### Sliders and inputs

* **Speed**: control the overall automatic rotation speed
* **Zoom**: control camera zoom level
* **Star Density**: control the number of background stars
* **Sphere Glow**: control sphere glow intensity
* **Star Glow**: control star glow intensity
* **Brightness**: control sphere brightness
* **Contrast**: control sphere contrast
* **Color Hue**: control the sphere color palette
* **Background Hue & Intensity**: control scene background
* **Axis X / Y / Z**: control weighted spin contribution per axis
* **Horiz. lines**: set the number of horizontal sphere lines
* **Vert. lines**: set the number of vertical sphere lines
* **Ring inner**: set the ring inner radius multiplier
* **Ring outer**: set the ring outer radius multiplier
* **Auto-warp interval**: set the delay between automatic warps in seconds

## Tech

* HTML
* CSS
* Vanilla JavaScript
* Canvas 2D

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

For development, using a small local static server is recommended.

## Notes

This project is a lightweight interactive graphics demo built without external libraries.

The sphere rendering, ring rendering, rotation logic, warp transitions, background stars, compass, glow effects, scene post-processing, auto-warp logic, and UI are all handled in plain JavaScript and CSS.

Warp transitions can randomize both visual scene settings and ring configuration, including whether a ring appears at all and how large it is.

## License

GNU General Public License v3.0