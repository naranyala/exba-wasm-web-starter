use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use std::collections::HashMap;
use lazy_static::lazy_static;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppState {
    pub counter: i32,
    pub current_route: String,
    pub user: Option<User>,
    pub settings: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub name: String,
    pub role: String,
}

// Global singleton for app state
lazy_static! {
    pub static ref GLOBAL_STATE: Mutex<AppState> = Mutex::new(AppState {
        counter: 0,
        current_route: "/".to_string(),
        user: Some(User {
            name: "Developer".to_string(),
            role: "Admin".to_string(),
        }),
        settings: HashMap::new(),
    });
}

pub fn get_state() -> AppState {
    GLOBAL_STATE.lock().unwrap().clone()
}

pub fn update_state<F>(mutation: F) 
where 
    F: FnOnce(&mut AppState) 
{
    let mut state = GLOBAL_STATE.lock().unwrap();
    mutation(&mut state);
}
