var exampleSocket = new WebSocket("ws://127.0.0.1:3012");

exampleSocket.onopen = function (event) {
    exampleSocket.send("Hello World");
};

exampleSocket.onmessage = function (event) {
  console.log("Server responds: " + event.data);
}

d3.json('fake_users1.json', function(data) {
    data = MG.convert.date(data, 'date');
    MG.data_graphic({
        title: "Line Chart",
        description: "This is a simple line chart.",
        area: false,
        data: data,
        width: 600,
        height: 200,
        right: 40,
        target: document.getElementById('fake_users1'),
        x_accessor: 'date',
        y_accessor: 'value'
    });
});
