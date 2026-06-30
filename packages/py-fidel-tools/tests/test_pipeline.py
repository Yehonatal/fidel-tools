import pytest
from fidel_tools import Pipeline, get_amharic_pack, normalize, sentence_tokenize, stem, remove_stopwords, lex_analyze, felig_transliterate, sera_transliterate, index_documents, index_query, weigh_terms

@pytest.fixture
def am_pack():
    return get_amharic_pack()

@pytest.fixture
def pipeline(am_pack):
    return Pipeline(am_pack)

def test_has_native():
    from fidel_tools import _HAS_NATIVE
    # Just print whether native Rust code is available
    print(f"Native extension loaded: {_HAS_NATIVE}")

def test_normalization_char_map(am_pack, pipeline):
    input_text = "ሐኪም ኀይሉ"
    expected = "ሃኪም ሃይሉ"
    assert normalize(input_text, am_pack) == expected
    assert pipeline.normalize(input_text) == expected

def test_normalization_labialized(am_pack, pipeline):
    input_text = "በልቷል ሟች"
    expected = "በልቱዋል ሙዋች"
    assert normalize(input_text, am_pack) == expected
    assert pipeline.normalize(input_text) == expected

def test_normalization_gemination(am_pack, pipeline):
    input_text = "እባክህህህህ በጣምምምምም"
    expected = "እባክህህ በጣምም"
    assert normalize(input_text, am_pack) == expected
    assert pipeline.normalize(input_text) == expected

def test_sentence_tokenization(am_pack, pipeline):
    input_text = "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!"
    expected = [
        "ይህ የመጀመሪያው ዓረፍተ ነገር ነው",
        "ሁለተኛው ደግሞ ይከተላል",
        "ሦስተኛውም አለ"
    ]
    assert sentence_tokenize(input_text, am_pack) == expected
    assert pipeline.sentence_tokenize(input_text) == expected
    assert pipeline.sentenceTokenize(input_text) == expected

def test_stemming(am_pack, pipeline):
    # Test cases for stemmer
    assert stem("ልጆቻቸውን", am_pack) == "ልጅ"
    assert pipeline.stem("ልጆቻቸውን") == "ልጅ"

def test_stopwords_removal(am_pack, pipeline):
    res = remove_stopwords("ይህ ሞባይል እና ኮምፒዩተር", am_pack)
    assert "እና" not in res
    assert "ይህ" not in res
    assert "ኮምፒዩተር" in res
    
    res_pipeline = pipeline.removeStopwords("ይህ ሞባይል እና ኮምፒዩተር")
    assert "እና" not in res_pipeline


def test_lex_analyze(am_pack, pipeline):
    input_text = "ሰላም ፣ እንዴት ነህ 123?"
    res = pipeline.lexAnalyze(input_text)
    assert "123" not in res
    assert "，" not in res or res.strip() == "ሰላም እንዴት ነህ"

def test_indexing_and_weighting(am_pack, pipeline):
    docs = [
        {"id": "doc1", "content": "አረንጓዴ ልማት ለሁሉም"},
        {"id": "doc2", "content": "ልማት እና እድገት በጋራ"}
    ]
    doc_index = pipeline.indexDocuments(docs)
    assert doc_index["corpus_size"] == 2
    assert "doc1" in doc_index["corpus_word_count"]
    
    weights = pipeline.weighTerms(doc_index, "doc")
    assert isinstance(weights, dict)

def test_spacy_tokenizer_wrapper(pipeline):
    # Test that we can instantiate the spacy tokenizer if spacy is available,
    # or skip if it's not installed.
    try:
        import spacy
        from fidel_tools.spacy_tokenizer import get_spacy_tokenizer
        nlp = spacy.blank("am")
        nlp.tokenizer = get_spacy_tokenizer(nlp, pipeline)
        doc = nlp("ይህ የመጀመሪያው ዓረፍተ ነገር ነው።")
        assert len(doc) > 0
    except ImportError:
        pytest.skip("spaCy is not installed, skipping spaCy integration test.")
