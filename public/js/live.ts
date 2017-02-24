declare var $: any;

interface Metric {
    date: Date,
    value: number,
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getContentDim(data) {
    if (Array.isArray(data)) {
        // If data is array, look into each item's dim
        return getContentDim(data[0]);
    } else {
        // If data is not an array, figure out its dim
        var dim = 0;
        if (isNumber(data.value)) {
            return 1;
        } else {
            data.value.forEach(function(value, i) {
                dim++;
            });
        }
        return dim;
    }
}

function getValueAtDim(data, d) {
    if (isNumber(data)) {
        return data;
    } else if (Array.isArray(data)) {
        // If data is array, look into each item's dim
        return data[d];
    } else if (data instanceof Object)  {
        // fetch the key at d-th index
        var k = Object.keys(data)[d];
        return data[k];
    } else {
        alert("unsupported data type");
    }
}

class SS {
    private socket: WebSocket;

    live: boolean;
    data: Array<Array<Metric>>;

    dim: number;
    last_date: Date;

    constructor(addr) {
        this.socket = new WebSocket(addr);
        this.socket.onmessage = (e: MessageEvent) => this.appendDataFromWSEvent(e);

        this.data = [];
        this.live = true;
    }

    stop() {
        // push null to every one
        for (var i = 0, len = this.data.length; i < len; i++) {
            this.data[i].push({'date': this.last_date, 'value': null});
        }
        this.live = false;
        this.socket.onmessage = null;
    }

    start() {
        this.live = true;
        this.socket.onmessage = (e) => this.appendDataFromWSEvent(e);
    }

    appendDataFromWSEvent(event: MessageEvent) {
        let data = JSON.parse(event.data);
        let dim = getContentDim(data);
        if (dim != this.dim) {
            this.dim = dim;
            drawNumFigures(dim);

            this.data = new Array(dim);
            for(var i = 0; i < dim; i++) this.data[i] = [];
        }

        if (Array.isArray(data)) {
            for (var i = 0, len1 = this.data.length; i < len1; i++) {
                for (var j = 0, len2 = data.length; j < len2; j++) {
                    this.data[i].push({'date': new Date(data[j].date),
                                       'value': getValueAtDim(data[j].value, i)});
                }
            }
        } else {
            for (var i = 0, len = this.data.length; i < len; i++) {
                this.data[i].push({'date': new Date(data.date),
                                   'value': getValueAtDim(data.value, i)});
            }
            this.last_date = data.date;
        }

        this.draw();
    }

    draw() {
        var one_minute = 60 * 1000;  // ms
        var now = new Date();
        var last_minute = (d) => (now.valueOf() - d.date.valueOf()) < one_minute;

        for (var i = 0, len = this.data.length; i < len; i++) {
            this.data[i] = this.data[i].filter(last_minute);
            if (this.data[i].length !== 0) {
                window["MG"].data_graphic({
                    title: "Metrics",
                    description: "Measurements",
                    data: this.data[i],
                    animate_on_load: false,
                    transition_on_update: false,
                    full_width: true,
                    height: 300,
                    linked: true,
                    // missing_is_hidden: true,
                    area: false,
                    target: document.getElementById('figure-' + i),
                    x_accessor: 'date',
                    y_accessor: 'value'
                });
            }
        }
    }
}

let ss = new SS("ws://" + window.location.hostname + ":3012");

function toggleLive() {
    if (ss.live) {
        ss.stop();
        $("#stopButton").html("Resume");
    } else {
        ss.start();
        $("#stopButton").html("Stop");
    }
}

function drawNumFigures(n: number) {
    $("#figures").empty();
    for (var i = 0; i < n; i++) {
        $("#figures").append('<div id="figure-' + i + '\"></div>');
    }
}
