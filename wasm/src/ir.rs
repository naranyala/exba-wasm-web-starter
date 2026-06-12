use serde::{Serialize, Deserialize};
use ts_rs::TS;

/// High-Level Intermediate Representation (HLIR).
/// Represents conceptual application-level transitions.
#[derive(Serialize, Deserialize, Debug, TS, Clone)]
#[ts(export)]
#[serde(tag = "type", content = "payload")]
pub enum HLIR {
    /// Atomic update to the global state store.
    UpdateState { patch: String },
    /// Change the active application route.
    Navigate { path: String },
    /// Trigger a system-level notification.
    Notify { level: String, msg: String },
    /// Invoke a registered JS callback.
    InvokeJS { func: String, args: String },
    /// Synchronize specific data with the WASM core.
    SyncData { key: String, value: String },
}

/// Low-Level Intermediate Representation (LLIR).
/// Represents atomic DOM mutations or system calls.
#[derive(Serialize, Deserialize, Debug, TS, Clone)]
#[ts(export)]
#[serde(tag = "type", content = "payload")]
pub enum LLIR {
    /// Updates the text content of a DOM element.
    UpdateText { id: String, text: String },
    /// Sets a specific attribute on a DOM element.
    SetAttribute { id: String, attr: String, value: String },
    /// Removes a specific attribute from a DOM element.
    RemoveAttribute { id: String, attr: String },
    /// Adds a CSS class to a DOM element.
    AddClass { id: String, class: String },
    /// Removes a CSS class from a DOM element.
    RemoveClass { id: String, class: String },
    /// Toggles a CSS class on a DOM element.
    ToggleClass { id: String, class: String },
    /// Sets a CSS style property.
    SetStyle { id: String, prop: String, value: String },
    /// Triggers a specific JS event on a DOM element.
    TriggerEvent { id: String, event: String },
    /// Logs a message to the browser console.
    Log { message: String },
    /// Reports an anomaly detected during processing.
    Anomaly { code: String, details: String },
}

/// A package of IR instructions resulting from a single action.
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct IRBundle {
    /// The version of the IR schema used.
    pub version: String,
    /// High-level application transitions.
    pub effects: Vec<HLIR>,
    /// Low-level atomic DOM mutations.
    pub llir: Vec<LLIR>,
}

/// Commands sent from the TS Bridge to the Rust core.
#[derive(Serialize, Deserialize, Debug, PartialEq, TS)]
#[ts(export)]
#[serde(tag = "type", content = "payload")]
pub enum IRCommand {
    SampleTaskFetch,
    SampleTaskSubmit { input: String },
    Add { a: i32, b: i32 },
    Fibonacci { n: i32 },
    Factorial { n: i32 },
    ReverseString { text: String },
    PalindromeCheck { text: String },
    Greet { name: String },
    ReportAnomaly { message: String },
    RulesQuery,
    SystemFetch,
    KanbanFetch,
    MoveTask { id: String, col: String },
    AddTask { title: String, priority: String, tags: Vec<String> },
    DeleteTask { id: String },
    EditTask { id: String, title: String, priority: String, tags: Vec<String> },
    SyncKanban { tasks: Vec<crate::kanban::KanbanTask> },
    PerformDiff { old_html: String, new_html: String },
}

/// Results returned from the Rust core to the TS Bridge.
#[derive(Serialize, Deserialize, Debug, PartialEq, TS)]
#[ts(export)]
#[serde(tag = "type", content = "payload")]
pub enum IRResult {
    SampleTaskData(crate::sample_task::SampleTaskState),
    Number(i32),
    Void,
    Error { message: String },
    Rules { schema: String },
    SystemInfo(crate::sys_info::SystemInfo),
    KanbanData(Vec<crate::kanban::KanbanTask>),
    DiffResult(Vec<crate::dom_engine::DomInstruction>),
}

#[cfg(test)]
mod ts_tests {
    use super::*;
    use ts_rs::Config;
    #[test]
    fn generate_types() {
        let config = Config::default();
        HLIR::export(&config).unwrap();
        LLIR::export(&config).unwrap();
        IRBundle::export(&config).unwrap();
        IRCommand::export(&config).unwrap();
        IRResult::export(&config).unwrap();
    }
}
