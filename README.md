# MetricsGraphics

This project implements a simple backend
for [MetricsGraphics.js](http://www.metricsgraphicsjs.org/) in Rust.  The
primary goal is be easy to use and integrate into another project for metrics
monitoring. We use various libraries from [iron](https://github.com/iron/) for
static file serving and the data communication is
through [websocket](https://github.com/housleyjk/ws-rs).

## Usage

```toml
[dependencies]
metrics-graphics = { git = "https://github.com/nebgnahz/metrics-graphics-rs" }
```

Then in your application, do:

```rust
let mut mg = metrics_graphics::init("127.0.0.1:3000");

mg.send(0.5);
```

Then open your browser at [http://127.0.0.1:3000](http://127.0.0.1:3000), you
will be able to see the metrics visualization (only a single point here).

Below is an example with some synthetic live data:

```rust
extern crate rand;
extern crate metrics_graphics;
use rand::Rng;

fn main() {
    let mut mg = metrics_graphics::init("127.0.0.1:3000");
    let mut rng = rand::thread_rng();
    loop {
        ::std::thread::sleep(::std::time::Duration::from_secs(1));
        ss.send((rng.gen::<f64>(), rng.gen::<f64>()));
    }
}
```
