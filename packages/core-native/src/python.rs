use pyo3::prelude::*;
use std::collections::HashMap;
use crate::Normalizer as CoreNormalizer;

#[pyclass]
pub struct PyNormalizer {
    inner: CoreNormalizer,
}

#[pymethods]
impl PyNormalizer {
    #[new]
    pub fn new(
        char_map: HashMap<String, String>,
        labialized_map: HashMap<String, String>,
        gemination_threshold: Option<usize>,
    ) -> Self {
        let mut rust_char_map = HashMap::new();
        for (k, v) in char_map {
            if let (Some(kc), Some(vc)) = (k.chars().next(), v.chars().next()) {
                rust_char_map.insert(kc, vc);
            }
        }

        let mut rust_labialized_map = HashMap::new();
        for (k, v) in labialized_map {
            if let Some(kc) = k.chars().next() {
                rust_labialized_map.insert(kc, v);
            }
        }

        PyNormalizer {
            inner: CoreNormalizer::new(rust_char_map, rust_labialized_map, gemination_threshold),
        }
    }

    pub fn normalize(&self, text: &str) -> String {
        self.inner.normalize(text)
    }
}

#[pymodule]
fn fidel_tools_core_native(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<PyNormalizer>()?;
    Ok(())
}
