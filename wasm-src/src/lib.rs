mod ir;
mod actions;

use wasm_bindgen::prelude::*;
use tracing::error;
use crate::ir::*;
use crate::actions::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
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
    use crate::actions::get_ir_bundle;

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
