use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmNormalizer {
    char_map: HashMap<char, char>,
    labialized_map: HashMap<char, String>,
    gemination_threshold: Option<usize>,
}

#[wasm_bindgen]
impl WasmNormalizer {
    #[wasm_bindgen(constructor)]
    pub fn new(
        char_map_val: JsValue,
        labialized_map_val: JsValue,
        gemination_threshold_val: JsValue,
    ) -> Result<WasmNormalizer, JsValue> {
        let char_map: HashMap<String, String> = serde_wasm_bindgen::from_value(char_map_val)?;
        let labialized_map: HashMap<String, String> = serde_wasm_bindgen::from_value(labialized_map_val)?;
        let gemination_threshold: Option<usize> = serde_wasm_bindgen::from_value(gemination_threshold_val)?;

        // Convert key-value of string to char for char_map
        let mut rust_char_map = HashMap::new();
        for (k, v) in char_map {
            if let (Some(kc), Some(vc)) = (k.chars().next(), v.chars().next()) {
                rust_char_map.insert(kc, vc);
            }
        }

        // Convert key of string to char for labialized_map
        let mut rust_labialized_map = HashMap::new();
        for (k, v) in labialized_map {
            if let Some(kc) = k.chars().next() {
                rust_labialized_map.insert(kc, v);
            }
        }

        Ok(WasmNormalizer {
            char_map: rust_char_map,
            labialized_map: rust_labialized_map,
            gemination_threshold,
        })
    }

    pub fn normalize(&self, text: &str) -> String {
        if text.is_empty() {
            return String::new();
        }

        // 1 & 2. Apply char_map and labialized_map in a single pass over characters
        let mut normalized = String::with_capacity(text.len());
        for mut c in text.chars() {
            if let Some(&mapped) = self.char_map.get(&c) {
                c = mapped;
            }
            if let Some(mapped_str) = self.labialized_map.get(&c) {
                normalized.push_str(mapped_str);
            } else {
                normalized.push(c);
            }
        }

        // 3. Collapse gemination
        if let Some(threshold) = self.gemination_threshold {
            if threshold > 0 {
                let mut collapsed = String::with_capacity(normalized.len());
                let mut chars_iter = normalized.chars().peekable();

                while let Some(c) = chars_iter.next() {
                    collapsed.push(c);
                    // Don't collapse whitespace (usually not needed, matching regex behavior `([^\\s])`)
                    if c.is_whitespace() {
                        continue;
                    }

                    let mut count = 1;
                    while let Some(&next_c) = chars_iter.peek() {
                        if next_c == c {
                            count += 1;
                            chars_iter.next(); // consume it
                        } else {
                            break;
                        }
                    }

                    if count > threshold {
                        // We already pushed the first character.
                        // We need to repeat it threshold - 1 more times.
                        for _ in 0..(threshold - 1) {
                            collapsed.push(c);
                        }
                    } else {
                        // Repeat it count - 1 times.
                        for _ in 0..(count - 1) {
                            collapsed.push(c);
                        }
                    }
                }
                normalized = collapsed;
            }
        }

        normalized
    }
}
