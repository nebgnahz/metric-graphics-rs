extern crate rand;
extern crate metrics_graphics;
use rand::Rng;

fn main() {
    let mut ss = metrics_graphics::init("127.0.0.1:3000");
    let mut rng = rand::thread_rng();
    loop {
        ::std::thread::sleep(::std::time::Duration::from_secs(1));
        ss.send((rng.gen::<f64>(), rng.gen::<f64>()));
    }
}
