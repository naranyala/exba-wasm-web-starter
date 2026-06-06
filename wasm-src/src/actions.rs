use tracing::{info, warn};
use thiserror::Error;
use crate::ir::*;

#[derive(Error, Debug)]
pub enum IRError {
    #[error("Unknown action ID: {0}")]
    UnknownAction(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
}

pub fn get_ir_bundle(action_id: &str) -> Result<IRBundle, IRError> {
    info!("Generating IR for action: {}", action_id);
    match action_id {
        "hello" => Ok(IRBundle {
            version: "1.0.0".into(),
            hlir: Some(HLIR::UIUpdate { 
                target_screen: "Greeting".into(), 
                state: "Active".into() 
            }),
            llir: vec![
                LLIR::Log { message: "Processing hello action".into() },
                LLIR::UpdateText { id: "greeting-box".into(), text: format!("Hello, User!") },
                LLIR::SetAttribute { id: "greeting-box".into(), attr: "class".into(), value: "highlighted".into() },
            ],
        }),
        "error_test" => Ok(IRBundle {
            version: "1.0.0".into(),
            hlir: None,
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
