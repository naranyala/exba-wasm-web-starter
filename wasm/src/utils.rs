pub mod string_utils {
    /// Trims and cleans a string of redundant whitespace.
    pub fn clean_whitespace(s: &str) -> String {
        s.split_whitespace().collect::<Vec<_>>().join(" ")
    }

    /// Converts a string to kebab-case.
    pub fn to_kebab_case(s: &str) -> String {
        s.chars()
            .enumerate()
            .map(|(i, c)| {
                if i > 0 && c.is_uppercase() {
                    format!("-{}", c.to_lowercase())
                } else {
                    c.to_lowercase().to_string()
                }
            })
            .collect()
    }
}

pub mod result_utils {
    /// Extension trait to provide convenient error mapping.
    pub trait ResultExt<T, E> {
        fn wrap_err(self, msg: &str) -> Result<T, String>;
    }

    impl<T, E: std::fmt::Display> ResultExt<T, E> for Result<T, E> {
        fn wrap_err(self, msg: &str) -> Result<T, String> {
            self.map_err(|e| format!("{}: {}", msg, e))
        }
    }
}

pub mod wasm_utils {
    use wasm_bindgen::prelude::*;

    /// Logs a value to the browser console.
    pub fn console_log<T: std::fmt::Debug>(val: T) {
        web_sys::console::log_1(&format!("{:?}", val).into());
    }

    /// Safely converts a JsValue to a specific Rust type.
    pub fn from_js_value<T: serde::de::DeserializeOwned>(val: JsValue) -> Result<T, String> {
        serde_wasm_bindgen::from_value(val).map_err(|e| e.to_string())
    }
}

pub mod math_utils {
    /// Linear interpolation between two floats.
    pub fn lerp(start: f64, end: f64, t: f64) -> f64 {
        start + (end - start) * t
    }

    /// Clamps a value between min and max.
    pub fn clamp(val: f64, min: f64, max: f64) -> f64 {
        if val < min { min } else if val > max { max } else { val }
    }
}

pub mod iter_utils {
    /// Splits a slice into chunks of a specific size.
    pub fn chunk<T, I>(iter: I, size: usize) -> Vec<Vec<T>>
    where
        I: IntoIterator<Item = T>,
    {
        let mut result = Vec::new();
        let mut current = Vec::with_capacity(size);
        for item in iter {
            current.push(item);
            if current.len() == size {
                result.push(std::mem::take(&mut current));
            }
        }
        if !current.is_empty() {
            result.push(current);
        }
        result
    }
}
