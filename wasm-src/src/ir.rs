use serde::{Serialize, Deserialize};

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
