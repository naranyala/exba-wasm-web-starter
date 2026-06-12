mod ir;
mod actions;
pub mod utils;
mod state;
pub mod sys_info;
pub mod kanban;
pub mod dom_engine;
pub mod sample_task;

use wasm_bindgen::prelude::*;
use tracing::{info, error, instrument};
use tracing_wasm::{WASMLayerConfigBuilder, WASMLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;
use crate::ir::*;
use crate::actions::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen(start)]
pub fn start() {
    // Initializes the WASM runtime and sets up the tracing subscriber for browser logging.
    let config = WASMLayerConfigBuilder::new().build();
    tracing::subscriber::set_global_default(
        Registry::default().with(WASMLayer::new(config))
    ).unwrap();
}

#[instrument]
fn process_ir_logic(command: IRCommand) -> IRResult {
    match command {
        IRCommand::SampleTaskFetch => {
            info!("SampleTask state requested");
            IRResult::SampleTaskData(sample_task::get_state())
        },
        IRCommand::SampleTaskSubmit { input } => {
            info!("SampleTask state update requested: {}", input);
            IRResult::SampleTaskData(sample_task::set_status(input))
        },
        IRCommand::Add { a, b } => {
            info!("Adding {} and {}", a, b);
            IRResult::Number(a + b)
        },
        IRCommand::Fibonacci { n } => {
            info!("Calculating Fibonacci({})", n);
            IRResult::Number(fibonacci_internal(n))
        },
        IRCommand::Factorial { n } => {
            info!("Calculating Factorial({})", n);
            IRResult::Number(factorial_internal(n))
        },
        IRCommand::ReverseString { text } => {
            info!("Reversing string: {}", text);
            IRResult::Rules { schema: text.chars().rev().collect() }
        },
        IRCommand::PalindromeCheck { text } => {
            info!("Checking palindrome: {}", text);
            let reversed: String = text.chars().rev().collect();
            IRResult::Number(if text == reversed { 1 } else { 0 })
        },
        IRCommand::Greet { name } => {
            info!("Greeting {}", name);
            extended_greet_internal(&name);
            IRResult::Void
        }
        IRCommand::ReportAnomaly { message } => {
            error!("Anomaly Reported: {}", message);
            IRResult::Void
        }
        IRCommand::RulesQuery => {
            info!("Rules requested");
            IRResult::Rules { 
                schema: "JSON-based IR, tag-content payload".to_string() 
            }
        },
        IRCommand::SystemFetch => {
            info!("System information requested");
            IRResult::SystemInfo(sys_info::gather_sys_info())
        },
        IRCommand::KanbanFetch => {
            info!("Kanban tasks requested");
            IRResult::KanbanData(kanban::get_tasks())
        },
        IRCommand::MoveTask { id, col } => {
            info!("Moving task: {} to {}", id, col);
            IRResult::KanbanData(kanban::move_task(&id, &col))
        },
        IRCommand::AddTask { title, priority, tags } => {
            info!("Adding task: {}", title);
            IRResult::KanbanData(kanban::add_task(title, priority, tags))
        },
        IRCommand::DeleteTask { id } => {
            info!("Deleting task: {}", id);
            IRResult::KanbanData(kanban::delete_task(&id))
        },
        IRCommand::EditTask { id, title, priority, tags } => {
            info!("Editing task: {}", id);
            IRResult::KanbanData(kanban::edit_task(&id, title, priority, tags))
        },
        IRCommand::SyncKanban { tasks } => {
            info!("Syncing Kanban tasks ({} tasks)", tasks.len());
            IRResult::KanbanData(kanban::sync_tasks(tasks))
        },
        IRCommand::PerformDiff { old_html, new_html } => {
            info!("DOM diffing requested (Tier 1)");
            let mut old_parser = crate::dom_engine::HtmlParser::new(&old_html);
            let old_nodes = old_parser.parse_nodes();
            let old_root = crate::dom_engine::DomNode::Element {
                tag: "root".to_string(),
                attrs: vec![],
                children: old_nodes,
            };

            let mut new_parser = crate::dom_engine::HtmlParser::new(&new_html);
            let new_nodes = new_parser.parse_nodes();
            let new_root = crate::dom_engine::DomNode::Element {
                tag: "root".to_string(),
                attrs: vec![],
                children: new_nodes,
            };

            let instructions = crate::dom_engine::diff(&old_root, &new_root);
            IRResult::DiffResult(instructions)
        }
    }
}

/// Processes an IR command and returns the corresponding result.
///
/// # Arguments
/// * `command_json` - A JSON string representing the IR command.
///
/// # Returns
/// A JsValue containing the IRResult.
#[wasm_bindgen]
pub fn process_ir(command_json: &str) -> Result<JsValue, JsValue> {
    info!("IR Command received: {}", command_json);

    let command: IRCommand = match serde_json::from_str(command_json) {
        Ok(cmd) => cmd,
        Err(e) => {
            let err_msg = format!("Invalid JSON: {}", e);
            error!("{}", err_msg);
            return Ok(serde_wasm_bindgen::to_value(&IRResult::Error { message: err_msg })?);
        }
    };

    let result = process_ir_logic(command);
    info!("IR Result produced: {:?}", result);
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

/// Processes a specific action by its ID.
///
/// # Arguments
/// * `action_id` - The unique identifier of the action to process.
///
/// # Returns
/// A JsValue containing the resulting IRBundle.
#[wasm_bindgen]
pub fn process_action(action_id: &str) -> JsValue {
    match get_ir_bundle(action_id) {
        Ok(bundle) => serde_wasm_bindgen::to_value(&bundle).unwrap(),
        Err(e) => {
            error!("Action processing failed: {}", e);
            let error_bundle = IRBundle {
                version: "1.0.0".into(),
                effects: vec![],
                llir: vec![LLIR::Anomaly { 
                    code: "ACTION_FAILED".into(), 
                    details: e.to_string() 
                }],
            };
            serde_wasm_bindgen::to_value(&error_bundle).unwrap()
        }
    }
}

/// Greets the user by displaying an alert in the browser.
///
/// # Arguments
/// * `name` - The name of the person to greet.
#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

/// Adds two integers together.
///
/// # Arguments
/// * `a` - First integer.
/// * `b` - Second integer.
///
/// # Returns
/// The sum of a and b.
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Calculates the Nth Fibonacci number.
///
/// # Arguments
/// * `n` - The position in the Fibonacci sequence.
///
/// # Returns
/// The Fibonacci number at position `n`.
#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    fibonacci_internal(n)
}

fn fibonacci_internal(n: i32) -> i32 {
    if n <= 1 { return n; }
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    a
}

fn factorial_internal(n: i32) -> i32 {
    (1..=n).product()
}

fn extended_greet_internal(name: &str) {
    let greeting = format!("Hello from Rust Wasm, {}", name);
    #[cfg(target_arch = "wasm32")]
    {
        use web_sys::window;
        if let Some(window) = window() {
            if let Some(document) = window.document() {
                document.set_title(&greeting);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::actions::get_ir_bundle;

    #[test]
    fn test_process_ir_add() {
        let command = IRCommand::Add { a: 10, b: 20 };
        let result = process_ir_logic(command);
        assert_eq!(result, IRResult::Number(30));
    }

    #[test]
    fn test_get_ir_bundle_hello() {
        let bundle = get_ir_bundle("hello").unwrap();
        assert_eq!(bundle.version, "1.0.0");
        assert!(!bundle.effects.is_empty());
    }
}

#[wasm_bindgen]
pub fn wasm_get_app_state() -> JsValue {
    let state = state::get_state();
    serde_wasm_bindgen::to_value(&state).unwrap()
}

#[wasm_bindgen]
pub fn wasm_update_app_state(patch_json: &str) -> JsValue {
    let patch: serde_json::Value = serde_json::from_str(patch_json).unwrap();
    state::update_state(|s| {
        if let Some(obj) = patch.as_object() {
            for (k, v) in obj {
                match k.as_str() {
                    "counter" => {
                        if let Some(val) = v.as_i64() { s.counter = val as i32; }
                    },
                    "current_route" => {
                        if let Some(val) = v.as_str() { s.current_route = val.to_string(); }
                    },
                    _ => {}
                }
            }
        }
    });
    wasm_get_app_state()
}

#[wasm_bindgen]
pub fn wasm_get_exposed_commands() -> JsValue {
    let commands = vec![
        serde_json::json!({ "name": "Add", "description": "Add two integers (Rust WASM)", "payload": "{ a: i32, b: i32 }" }),
        serde_json::json!({ "name": "Fibonacci", "description": "Calculate sequence Fibonacci index (WASM)", "payload": "{ n: i32 }" }),
        serde_json::json!({ "name": "Factorial", "description": "Compute Factorial product of N (WASM)", "payload": "{ n: i32 }" }),
        serde_json::json!({ "name": "ReverseString", "description": "Reverse a string value via Rust memory", "payload": "{ text: String }" }),
        serde_json::json!({ "name": "PalindromeCheck", "description": "Determine palindrome correctness (WASM)", "payload": "{ text: String }" }),
        serde_json::json!({ "name": "Greet", "description": "Greet and update the browser window title", "payload": "{ name: String }" }),
        serde_json::json!({ "name": "SystemFetch", "description": "Query hardware diagnostics (WASM)", "payload": "None" }),
        serde_json::json!({ "name": "KanbanFetch", "description": "Fetch Kanban tasks (WASM)", "payload": "None" }),
        serde_json::json!({ "name": "MoveTask", "description": "Move Kanban task to column (WASM)", "payload": "{ id: String, col: String }" }),
        serde_json::json!({ "name": "AddTask", "description": "Add new Kanban task (WASM)", "payload": "{ title: String, priority: String, tags: Vec<String> }" }),
        serde_json::json!({ "name": "DeleteTask", "description": "Delete Kanban task by ID (WASM)", "payload": "{ id: String }" }),
        serde_json::json!({ "name": "EditTask", "description": "Edit Kanban task details (WASM)", "payload": "{ id: String, title: String, priority: String, tags: Vec<String> }" }),
        serde_json::json!({ "name": "SyncKanban", "description": "Sync local tasks with Rust memory (WASM)", "payload": "{ tasks: Vec<KanbanTask> }" }),
        serde_json::json!({ "name": "SampleTaskFetch", "description": "Fetch Sample Task state (WASM)", "payload": "None" }),
        serde_json::json!({ "name": "SampleTaskSubmit", "description": "Mutate Sample Task state (WASM)", "payload": "{ input: String }" }),
    ];
    serde_wasm_bindgen::to_value(&commands).unwrap()
}
