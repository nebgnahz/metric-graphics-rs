// Global state SS: Shishi
var SS = {
    sourceFunc: null,
    drawFunc: null,
    data: [],

    socket: null,

    i: 0
}

function startLive(ss) {
    ss.sourceFunc = null;
    // setInterval(function() {
    //     var date = new Date();
    //     var value = Math.sin(ss.i / 100 * 2 * Math.PI);

    //     ss.i++;
    //     ss.data.push({'date': date, 'value': value});
    // }, 100);

    ss.drawFunc = setInterval(function() {
        var one_minute = 10 * 1000;  // ms
        var now = new Date();
        ss.data = ss.data.filter((d) => (now - d.date) < one_minute);
        if (ss.data.length !== 0) {
            MG.data_graphic({
                title: "Metrics",
                description: "Measurements",
                data: ss.data,
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
    }, 1000);

    if (ss.socket === null) {
        ss.socket = new WebSocket("ws://127.0.0.1:3012");
        ss.socket.onmessage = (e) => appendDataFromWSEvent(ss, e);
    } else {
        ss.socket.onmessage = (e) => appendDataFromWSEvent(ss, e);
    }
}

function stopLive(ss) {
    clearInterval(ss.sourceFunc);
    ss.sourceFunc = null;
    clearInterval(ss.drawFunc);
    ss.drawFunc = null;

    var date = new Date();
    var value = null;

    ss.data.push({'date': date, 'value': value});

    ss.socket.onmessage = null;
}

function isLive(ss) {
    return (ss.sourceFunc !== null && ss.drawFunc !== null);
}

startLive(SS);
function toggleLive() {
    if (isLive(SS)) {
        stopLive(SS);
        $("#stopButton").html("Resume");
    } else {
        startLive(SS);
        $("#stopButton").html("Stop");
    }
}

////////////////////////////////////////////////////////////////////////////////
//
//  Socket communication
//
////////////////////////////////////////////////////////////////////////////////
function appendDataFromWSEvent(ss, event) {
    // parse message as JSON
    var data = JSON.parse(event.data);
    if (Array.isArray(data)) {
        data = data.map((unix_ts) => new Date(unix_ts))
        ss.data.push(...data);
    } else {
        data.date = new Date(data.date)
        ss.data.push(data);
    }
}
