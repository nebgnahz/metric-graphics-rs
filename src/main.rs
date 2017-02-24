extern crate rand;
extern crate shishi;
use rand::Rng;

fn main() {
    let mut ss = shishi::init();

    let mut rng = rand::thread_rng();
    loop {
        ::std::thread::sleep(::std::time::Duration::from_secs(1));

        ss.send((rng.gen::<f64>(), rng.gen::<f64>()));
    }
}
