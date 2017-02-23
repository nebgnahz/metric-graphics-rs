declare var $: any;

interface Metric {
    date: Date,
    value: number,
}

class SS {
    private socket: WebSocket;

    live: boolean;
    data: Array<Metric>;

    constructor(addr) {
        this.socket = new WebSocket(addr);
        this.socket.onmessage = (e: MessageEvent) => this.appendDataFromWSEvent(e);

        this.data = [];
        this.live = true;
    }

    stop() {
        let date = new Date();
        this.data.push({'date': date, 'value': null});
        this.live = false;
        this.socket.onmessage = null;
    }

    start() {
        this.live = true;
        this.socket.onmessage = (e) => this.appendDataFromWSEvent(e);
    }

    appendDataFromWSEvent(event: MessageEvent) {
        // parse message as JSON
        var data = JSON.parse(event.data);
        if (Array.isArray(data)) {
            // data.forEach((p, i, a) => a[i].date = new Date(a[i].date));
            // ss.data.push(...data);
        } else {
            data.date = new Date(data.date)
            data.value = data.value[0];
            ss.data.push(data);
        }

        this.draw();
    }

    draw() {
        var one_minute = 10 * 1000;  // ms
        var now = new Date();
        this.data = this.data.filter((d) => (now.valueOf() - d.date.valueOf()) < one_minute);
        if (this.data.length !== 0) {
            window["MG"].data_graphic({
                title: "Metrics",
                description: "Measurements",
                data: this.data,
                animate_on_load: false,
                transition_on_update: false,
                full_width: true,
                height: 600,
                // missing_is_hidden: true,
                area: false,
                target: document.getElementById('figure'),
                x_accessor: 'date',
                y_accessor: 'value'
            });
        }
    }
}

let ss = new SS("ws://127.0.0.1:3012");

function toggleLive() {
    if (ss.live) {
        ss.stop();
        $("#stopButton").html("Resume");
    } else {
        ss.start();
        $("#stopButton").html("Stop");
    }
}
