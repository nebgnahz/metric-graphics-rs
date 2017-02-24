extern crate rand;
extern crate metrics_graphics;
use rand::Rng;

fn main() {
    let mut ss = metrics_graphics::init("127.0.0.1:3000");
    let mut rng = rand::thread_rng();
    loop {
        ::std::thread::sleep(::std::time::Duration::from_secs(1));
        if rng.gen() {
            ss.send((rng.gen::<f64>(), Some(rng.gen::<f64>() * 100.0), rng.gen::<f64>() + 2.0));
        } else {
            ss.send((rng.gen::<f64>(), None, rng.gen::<f64>() + 2.0));
        }
    }
}
