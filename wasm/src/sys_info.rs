use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use web_sys::{Window, Navigator, Screen};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, TS)]
#[ts(export)]
pub struct SystemInfo {
    pub os: String,
    pub browser: String,
    pub cpu_cores: u32,
    pub ram_gb: f64,
    pub screen_res: String,
    pub gpu: String,
    pub uptime_ms: f64,
    pub language: String,
}

pub fn gather_sys_info() -> SystemInfo {
    let window = web_sys::window().expect("no global `window` exists");
    let nav = window.navigator();
    let screen = window.screen().ok();
    let perf = window.performance();

    SystemInfo {
        os: get_os(&nav),
        browser: get_browser(&nav),
        cpu_cores: nav.hardware_concurrency() as u32,
        ram_gb: get_ram(&nav),
        screen_res: get_screen_res(screen),
        gpu: get_gpu(&window),
        uptime_ms: perf.map(|p| p.now()).unwrap_or(0.0),
        language: nav.language().unwrap_or_else(|| "unknown".to_string()),
    }
}

fn get_os(nav: &Navigator) -> String {
    let user_agent = nav.user_agent().unwrap_or_default().to_lowercase();
    if user_agent.contains("win") { "Windows".to_string() }
    else if user_agent.contains("mac") { "macOS".to_string() }
    else if user_agent.contains("linux") { "Linux".to_string() }
    else if user_agent.contains("android") { "Android".to_string() }
    else if user_agent.contains("iphone") || user_agent.contains("ipad") { "iOS".to_string() }
    else { "Unknown OS".to_string() }
}

fn get_browser(nav: &Navigator) -> String {
    let user_agent = nav.user_agent().unwrap_or_default().to_lowercase();
    if user_agent.contains("edg/") { "Edge".to_string() }
    else if user_agent.contains("chrome") && !user_agent.contains("chromium") { "Chrome".to_string() }
    else if user_agent.contains("firefox") { "Firefox".to_string() }
    else if user_agent.contains("safari") && !user_agent.contains("chrome") { "Safari".to_string() }
    else if user_agent.contains("opera") || user_agent.contains("opr/") { "Opera".to_string() }
    else { "Chromium/Other".to_string() }
}

fn get_ram(nav: &Navigator) -> f64 {
    js_sys::Reflect::get(nav, &JsValue::from_str("deviceMemory"))
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(0.0)
}

fn get_screen_res(screen: Option<Screen>) -> String {
    match screen {
        Some(s) => {
            let w = s.width().unwrap_or(0);
            let h = s.height().unwrap_or(0);
            format!("{}x{}", w, h)
        },
        None => "Unknown".to_string(),
    }
}

fn get_gpu(window: &Window) -> String {
    let document = window.document().expect("no document exists");
    let canvas = document.create_element("canvas").ok()
        .and_then(|e| e.dyn_into::<web_sys::HtmlCanvasElement>().ok());
    
    if let Some(canvas) = canvas {
        let gl = canvas.get_context("webgl").ok().flatten()
            .and_then(|ctx| ctx.dyn_into::<web_sys::WebGlRenderingContext>().ok());
        
        if let Some(gl) = gl {
            let extension = gl.get_extension("WEBGL_debug_renderer_info").ok().flatten();
            if let Some(_ext) = extension {
                let unmasked_renderer_webgl = 0x9246; // UNMASKED_RENDERER_WEBGL
                return gl.get_parameter(unmasked_renderer_webgl).ok()
                    .and_then(|v| v.as_string())
                    .unwrap_or_else(|| "Unknown GPU".to_string());
            }
        }
    }
    "Unknown GPU".to_string()
}
