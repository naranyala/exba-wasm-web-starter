use tracing::{info, warn};
use thiserror::Error;
use crate::ir::*;

/// Errors that can occur during the generation of IR bundles.
#[derive(Error, Debug)]
pub enum IRError {
    /// The requested action identifier was not found in the registry.
    #[error("Unknown action: {0}")]
    UnknownAction(String),
}

/// Maps a high-level action identifier to a specific sequence of IR instructions.
/// This function serves as the "Brain" of the system, deciding what happens 
/// when a specific business action is triggered.
///
/// # Arguments
/// * `action_id` - The unique string identifier for the action.
///
/// # Returns
/// A Result containing the IRBundle for the action or an IRError if not found.
pub fn get_ir_bundle(action_id: &str) -> Result<IRBundle, IRError> {
    info!("Generating IR for action: {}", action_id);
    match action_id {
        "hello" => Ok(IRBundle {
            version: "1.0.0".into(),
            effects: vec![HLIR::UpdateState { 
                patch: r#"{"greeting": "Active"}"#.into() 
            }],
            llir: vec![
                LLIR::Log { message: "Processing hello action".into() },
                LLIR::UpdateText { id: "greeting-box".into(), text: format!("Hello, User!") },
                LLIR::SetAttribute { id: "greeting-box".into(), attr: "class".into(), value: "highlighted".into() },
            ],
        }),
        "error_test" => Ok(IRBundle {
            version: "1.0.0".into(),
            effects: vec![],
            llir: vec![
                LLIR::Anomaly { 
                    code: "ERR_001".into(), 
                    details: "Simulated system anomaly for testing".into() 
                },
            ],
        }),
        _ => {
            warn!("Unknown action requested: {}", action_id);
            Err(IRError::UnknownAction(action_id.to_string()))
        }
    }
}
