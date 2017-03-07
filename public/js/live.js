function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function getContentDim(data) {
    if (Array.isArray(data)) {
        // If data is array, look into each item's dim
        return getContentDim(data[0]);
    }
    else {
        // If data is not an array, figure out its dim
        var dim = 0;
        if (isNumber(data.value)) {
            return 1;
        }
        else if (Array.isArray(data.value)) {
            // If data.value is array, look into each item's dim
            return data.value.length;
        }
        else if (data.value instanceof Object) {
            return Object.keys(data.value).length;
        }
        else {
            alert("unsupported data type");
        }
    }
}
function getValueAtDim(data, d) {
    if (isNumber(data)) {
        return data;
    }
    else if (Array.isArray(data)) {
        // If data is array, look into each item's dim
        return data[d];
    }
    else if (data instanceof Object) {
        // fetch the key at d-th index
        var k = Object.keys(data)[d];
        return data[k];
    }
    else {
        alert("unsupported data type");
    }
}
var MetricsGraphics = (function () {
    function MetricsGraphics(addr) {
        var _this = this;
        this.socket = new WebSocket(addr);
        this.socket.onmessage = function (e) { return _this.appendDataFromWSEvent(e); };
        this.data = [];
        this.live = true;
        this.timer = setInterval(this.draw.bind(this), 1000);
    }
    MetricsGraphics.prototype.stop = function () {
        // push null to every one
        for (var i = 0, len = this.data.length; i < len; i++) {
            this.data[i].push({ 'date': this.last_date, 'value': null });
        }
        this.live = false;
        this.socket.onmessage = null;
        clearInterval(this.timer);
    };
    MetricsGraphics.prototype.start = function () {
        var _this = this;
        this.live = true;
        this.socket.onmessage = function (e) { return _this.appendDataFromWSEvent(e); };
        this.timer = setInterval(this.draw.bind(this), 1000);
    };
    MetricsGraphics.prototype.appendDataFromWSEvent = function (event) {
        var data = JSON.parse(event.data);
        var dim = getContentDim(data);
        if (dim != this.dim) {
            this.dim = dim;
            drawNumFigures(dim);
            this.data = new Array(dim);
            for (var i = 0; i < dim; i++)
                this.data[i] = [];
        }
        if (Array.isArray(data)) {
            for (var i = 0, len1 = this.data.length; i < len1; i++) {
                for (var j = 0, len2 = data.length; j < len2; j++) {
                    this.data[i].push({ 'date': new Date(data[j].date),
                        'value': getValueAtDim(data[j].value, i) });
                }
            }
        }
        else {
            for (var i = 0, len = this.data.length; i < len; i++) {
                this.data[i].push({ 'date': new Date(data.date),
                    'value': getValueAtDim(data.value, i) });
            }
            this.last_date = data.date;
        }
    };
    MetricsGraphics.prototype.draw = function () {
        var one_minute = 60 * 1000; // ms
        var now = new Date();
        var last_minute = function (d) { return (now.valueOf() - d.date.valueOf()) < one_minute; };
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
    };
    return MetricsGraphics;
}());
var mg = new MetricsGraphics("ws://" + window.location.hostname + ":3012");
function toggleLive() {
    if (mg.live) {
        mg.stop();
        $("#stopButton").html("Resume");
    }
    else {
        mg.start();
        $("#stopButton").html("Stop");
    }
}
function drawNumFigures(n) {
    $("#figures").empty();
    for (var i = 0; i < n; i++) {
        $("#figures").append('<div id="figure-' + i + '\"></div>');
    }
}
