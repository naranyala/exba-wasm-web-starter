use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use thiserror::Error;
use tracing::{info, warn, error};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Error, Debug)]
pub enum IRError {
    #[error("Unknown action ID: {0}")]
    UnknownAction(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
}

// =============================================================================
// IR RULES:
// 1. HLIR (High-Level IR) defines intent.
// 2. LLIR (Low-Level IR) defines concrete DOM/Browser mutations.
// 3. All IR sequences must be atomic per action.
// 4. ANOMALIES must be explicitly logged via the Log instruction.
// =============================================================================

#[derive(Serialize, Deserialize, Debug)]
pub enum HLIR {
    UIUpdate { target_screen: String, state: String },
    SystemNotification { level: String, msg: String },
    ExternalLink { url: String, target: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum LLIR {
    UpdateText { id: String, text: String },
    SetAttribute { id: String, attr: String, value: String },
    TriggerEvent { id: String, event: String },
    Log { message: String },
    Anomaly { code: String, details: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IRBundle {
    pub version: String,
    pub hlir: Option<HLIR>,
    pub llir: Vec<LLIR>,
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

fn get_ir_bundle(action_id: &str) -> Result<IRBundle, IRError> {
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

#[wasm_bindgen]
pub fn process_action(action_id: &str) -> JsValue {
    match get_ir_bundle(action_id) {
        Ok(bundle) => serde_wasm_bindgen::to_value(&bundle).unwrap(),
        Err(e) => {
            error!("Action processing failed: {}", e);
            let error_bundle = IRBundle {
                version: "1.0.0".into(),
                hlir: None,
                llir: vec![LLIR::Anomaly { 
                    code: "ACTION_FAILED".into(), 
                    details: e.to_string() 
                }],
            };
            serde_wasm_bindgen::to_value(&error_bundle).unwrap()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_ir_bundle_hello() {
        let bundle = get_ir_bundle("hello").unwrap();
        assert_eq!(bundle.version, "1.0.0");
        assert!(bundle.hlir.is_some());
        assert_eq!(bundle.llir.len(), 3);
    }

    #[test]
    fn test_get_ir_bundle_anomaly() {
        let bundle = get_ir_bundle("error_test").unwrap();
        assert!(bundle.hlir.is_none());
        match &bundle.llir[0] {
            LLIR::Anomaly { code, .. } => assert_eq!(code, "ERR_001"),
            _ => panic!("Expected Anomaly"),
        }
    }

    #[test]
    fn test_get_ir_bundle_unknown() {
        let result = get_ir_bundle("unknown");
        assert!(result.is_err());
    }
}
