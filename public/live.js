var exampleSocket = new WebSocket("ws://127.0.0.1:3012");

exampleSocket.onopen = function (event) {
    exampleSocket.send("Hello World");
};

exampleSocket.onmessage = function (event) {
  console.log("Server responds: " + event.data);
}

