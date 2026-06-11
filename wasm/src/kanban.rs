use serde::{Serialize, Deserialize};
use ts_rs::TS;
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, TS)]
#[ts(export)]
pub struct KanbanTask {
    pub id: String,
    pub title: String,
    pub col: String,
    pub priority: String,
    pub tags: Vec<String>,
}

lazy_static! {
    static ref TASKS: Mutex<Vec<KanbanTask>> = Mutex::new(vec![
        KanbanTask { id: "1".into(), title: "WASM Performance Benchmarking".into(), col: "todo".into(), priority: "High".into(), tags: vec!["core".into(), "bench".into()] },
        KanbanTask { id: "2".into(), title: "Refactor Component Bridge".into(), col: "todo".into(), priority: "Medium".into(), tags: vec!["refactor".into()] },
        KanbanTask { id: "3".into(), title: "Implement Glassmorphism UI".into(), col: "in-progress".into(), priority: "Low".into(), tags: vec!["ui".into()] },
        KanbanTask { id: "4".into(), title: "Initial Project Layout".into(), col: "done".into(), priority: "High".into(), tags: vec!["setup".into()] },
        KanbanTask { id: "5".into(), title: "Write Documentation".into(), col: "todo".into(), priority: "Medium".into(), tags: vec!["docs".into()] },
        KanbanTask { id: "6".into(), title: "Setup CI/CD Pipeline".into(), col: "in-progress".into(), priority: "High".into(), tags: vec!["devops".into()] },
    ]);
}

pub fn get_tasks() -> Vec<KanbanTask> {
    TASKS.lock().unwrap().clone()
}

pub fn move_task(id: &str) -> Vec<KanbanTask> {
    let mut tasks = TASKS.lock().unwrap();
    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        let sequence = vec!["todo", "in-progress", "done", "todo"];
        if let Some(pos) = sequence.iter().position(|&s| s == task.col) {
            task.col = sequence[pos + 1].to_string();
        }
    }
    tasks.clone()
}

pub fn add_task(title: String, priority: String, tags: Vec<String>) -> Vec<KanbanTask> {
    let mut tasks = TASKS.lock().unwrap();
    let id = (tasks.len() + 1).to_string();
    let new_task = KanbanTask {
        id,
        title,
        col: "todo".into(),
        priority,
        tags,
    };
    tasks.push(new_task);
    tasks.clone()
}

pub fn delete_task(id: &str) -> Vec<KanbanTask> {
    let mut tasks = TASKS.lock().unwrap();
    tasks.retain(|t| t.id != id);
    tasks.clone()
}
