# shishi

A library (or application) to draw live time-series data.

## Architecture

You can run this application in two different modes:

```
Visual Client <=> Websocket Server <=> Source Client
```

### Visual Client

Use [MetricGrpahics](http://metricsgraphicsjs.org) and some custom webpage layout to get started.

### Websocket Server

A daemon.

Use Rust websocket library: [ws](https://github.com/housleyjk/ws-rs).

### Source Client

Publish data.

There can be more langauge support here; but Rust with [ws](https://github.com/housleyjk/ws-rs) will be supported.

## Misc

shishi means live data in Chinese; I am not trying to creative about naming the project.
