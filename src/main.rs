extern crate rand;
extern crate metrics_graphics;
use rand::Rng;
#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
struct Test {
    a: f64,
    b: f64,
}

fn main() {
    let mut ss = metrics_graphics::init("127.0.0.1:3000");
    let mut rng = rand::thread_rng();
    loop {
        ::std::thread::sleep(::std::time::Duration::from_millis(20));
        ss.send(Test {
            a: rng.gen::<f64>(),
            b: rng.gen::<f64>(),
        });
    }
}
