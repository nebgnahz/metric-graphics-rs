#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate serde_json;
extern crate iron;
extern crate mount;
extern crate staticfile;
extern crate time;
extern crate ws;
extern crate serde;

use mount::Mount;
use staticfile::Static;
use ws::listen;
use std::path::Path;
use iron::Iron;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

fn unix_time_now() -> i64 {
    unix_time_format_ms(time::get_time())
}

fn unix_time_format_ms(t: time::Timespec) -> i64 {
    t.sec * 1_000 + (t.nsec / 1_000_000) as i64
}

#[derive(Serialize, Deserialize, Debug)]
struct Datum<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    date: i64,
    value: T,
}

#[derive(Serialize, Deserialize, Debug)]
struct History<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    q: VecDeque<Datum<T>>,
    s: usize,
}

impl<T> History<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    fn new(size: usize) -> Self {
        History {
            q: VecDeque::with_capacity(size),
            s: size,
        }
    }

    fn add(&mut self, d: Datum<T>) {
        self.q.push_back(d)
    }

    fn to_string(&self) -> String {
        json!(self.q).to_string()
    }
}

pub struct Ss<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    inner: Arc<Mutex<SsInner<T>>>,
}

impl<T> Clone for Ss<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    fn clone(&self) -> Ss<T> {
        Ss { inner: self.inner.clone() }
    }
}

pub struct SsInner<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    h: History<T>,
    conn: Vec<ws::Sender>,
}

struct SsHandler<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    id: usize,
    ss: Arc<Mutex<SsInner<T>>>,
}

impl<T> Ss<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    fn new() -> Self {
        Ss {
            inner: Arc::new(Mutex::new(SsInner {
                h: History::new(1024),
                conn: Vec::with_capacity(1024),
            })),
        }
    }

    pub fn send(&mut self, t: T) {
        let mut inner = self.inner.lock().unwrap();
        let d = Datum {
            date: unix_time_now(),
            value: t,
        };
        let msg = ws::Message::Text(json!(d).to_string());
        (*inner).h.add(d);
        if let Some(one_conn) = (*inner).conn.first() {
            let _ = one_conn.broadcast(msg);
        }
    }

    fn handle(&mut self, conn: ws::Sender) -> SsHandler<T> {
        let mut inner = self.inner.lock().unwrap();
        (*inner).conn.push(conn);
        SsHandler {
            id: (*inner).conn.len() - 1,
            ss: self.inner.clone(),
        }
    }
}

impl<T> ws::Handler for SsHandler<T>
    where T: serde::Serialize + serde::Deserialize + Send
{
    fn on_open(&mut self, _shake: ws::Handshake) -> ws::Result<()> {
        let inner = self.ss.lock().unwrap();
        (*inner).conn[self.id].send(ws::Message::Text((*inner).h.to_string()))
    }

    fn on_message(&mut self, msg: ws::Message) -> ws::Result<()> {
        let inner = self.ss.lock().unwrap();
        (*inner).conn[self.id].send(msg)
    }
}

pub fn init<T>() -> Ss<T>
    where T: serde::Serialize + serde::Deserialize + Send + 'static
{
    // Static file server
    ::std::thread::spawn(|| {
        let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/public");
        let mut mount = Mount::new();
        mount.mount("/", Static::new(Path::new(dir)));
        Iron::new(mount).http("localhost:3000").unwrap();
    });

    let ss = Ss::new();

    // Websocket thread
    let mut ss_clone = ss.clone();
    ::std::thread::spawn(move || {
        if let Err(error) = listen("127.0.0.1:3012", |out| ss_clone.handle(out)) {
            println!("Failed to create WebSocket due to {:?}", error);
        }
    });

    ss
}
