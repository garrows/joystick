# Joystick

Joystick component - Emulate a joystick on a canvas. 

## Installation

```bash
$ component install garrows/joystick
```

## Usage

```js
var joystick = new Joystick(canvas, function(value) {
    console.log(value); //{x: 0.18, y: 0.34, left: 34, right: -12}
});

```

## License

MIT