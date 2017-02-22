extern crate ws;

use ws::*;

fn main() {
    if let Err(error) = listen("127.0.0.1:3012", |out| move |msg| out.send(msg)) {
        println!("Failed to create WebSocket due to {:?}", error);
    }
}
