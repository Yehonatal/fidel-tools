from .__init__ import Pipeline

def get_spacy_tokenizer(nlp, pipeline: Pipeline):
    """
    Creates a spaCy-compatible tokenizer wrapper.
    
    Usage:
        import spacy
        from fidel_tools import Pipeline, get_spacy_tokenizer, get_amharic_pack
        
        nlp = spacy.blank("am")
        pipeline = Pipeline(get_amharic_pack())
        nlp.tokenizer = get_spacy_tokenizer(nlp, pipeline)
        
        doc = nlp("ይህ የመጀመሪያው ዓረፍተ ነገር ነው።")
        print([token.text for token in doc])
    """
    try:
        from spacy.tokens import Doc
    except ImportError:
        raise ImportError(
            "spaCy is not installed. Please install spaCy to use the spacy tokenizer wrapper: pip install spacy"
        )
    
    class FidelSpacyTokenizer:
        def __init__(self, vocab, pipeline: Pipeline):
            self.vocab = vocab
            self.pipeline = pipeline
            
        def __call__(self, text: str) -> Doc:
            # Match pipeline behavior
            normalized = self.pipeline.normalize(text)
            analyzed = self.pipeline.lexAnalyze(normalized)
            words = [w for w in analyzed.split(" ") if w]
            return Doc(self.vocab, words=words)
            
    return FidelSpacyTokenizer(nlp.vocab, pipeline)
