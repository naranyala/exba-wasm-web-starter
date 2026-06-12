use serde::{Serialize, Deserialize};
use ts_rs::TS;
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Serialize, Deserialize, Debug, Clone, TS, PartialEq)]
#[ts(export)]
pub struct SampleTaskState {
    pub status: String,
}

lazy_static! {
    static ref GLOBAL_FEATURE_STATE: Mutex<SampleTaskState> = Mutex::new(SampleTaskState {
        status: "Initialized inside Rust WASM".to_string(),
    });
}

pub fn get_state() -> SampleTaskState {
    GLOBAL_FEATURE_STATE.lock().unwrap().clone()
}

pub fn set_status(new_status: String) -> SampleTaskState {
    let mut state = GLOBAL_FEATURE_STATE.lock().unwrap();
    state.status = new_status;
    state.clone()
}
