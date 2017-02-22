extern crate ws;
extern crate staticfile;
extern crate iron;
extern crate mount;

use mount::Mount;
use staticfile::Static;
use ws::listen;
use std::path::Path;
use iron::Iron;

fn main() {
    ::std::thread::spawn(|| {
        let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/public");
        let mut mount = Mount::new();
        mount.mount("/", Static::new(Path::new(dir)));
        Iron::new(mount).http("localhost:3000").unwrap();
    });

    if let Err(error) = listen("127.0.0.1:3012", |out| move |msg| out.send(msg)) {
        println!("Failed to create WebSocket due to {:?}", error);
    }
}
