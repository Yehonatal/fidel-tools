import re
import math
from .lang_am import get_amharic_pack

# Try to load the native extension
try:
    from .fidel_tools_core_native import PyNormalizer
    _HAS_NATIVE = True
except ImportError:
    _HAS_NATIVE = False

# Global cache for reversed transliteration maps
_REVERSE_MAP_CACHE = {}

def get_reverse_map(lookup_map: dict) -> dict:
    map_id = id(lookup_map)
    if map_id not in _REVERSE_MAP_CACHE:
        reverse = {}
        for k, v in lookup_map.items():
            if v not in reverse:
                reverse[v] = k
        _REVERSE_MAP_CACHE[map_id] = reverse
    return _REVERSE_MAP_CACHE[map_id]

def is_punctuation_or_space(char: str) -> bool:
    return (
        char.isspace()
        or char in ("።", "፣", "፤", "፦", "፡", "?", ".", ",", "!", ":", ";")
    )

# Individual processing functions
def normalize(text: str, pack: dict) -> str:
    """
    Normalizes Amharic text by applying character mapping,
    labialized sequence normalization, and gemination collapse.
    """
    if not text:
        return ""
    
    norm_config = pack.get("normalization")
    if not norm_config:
        return text
        
    # Apply char_map and labialized_map in a single pass over characters
    char_map = norm_config.get("char_map") or {}
    labialized_map = norm_config.get("labialized_map") or {}
    
    if char_map or labialized_map:
        chars = list(text)
        for i, char in enumerate(chars):
            if char in char_map:
                char = char_map[char]
            if char in labialized_map:
                char = labialized_map[char]
            chars[i] = char
        text = "".join(chars)
        
    # Collapse gemination
    threshold = norm_config.get("gemination_threshold")
    if threshold is not None and threshold > 0:
        pattern = re.compile(r"([^\s])\1{" + str(threshold) + r",}")
        text = pattern.sub(lambda m: m.group(1) * threshold, text)
        
    return text

def sentence_tokenize(text: str, pack: dict) -> list:
    """
    Tokenizes Amharic text into sentences using configured sentence boundaries.
    """
    if not text:
        return []
    
    boundaries = (pack.get("tokenization") or {}).get("sentence_boundaries")
    if boundaries is None:
        boundaries = ["።", "፡", "?", "!", "."]
        
    if not boundaries:
        return [text]
        
    # Escape boundaries for regex character class
    escaped = "".join(re.escape(b) for b in boundaries)
    parts = re.split(rf"[{escaped}]+", text)
    
    result = []
    for s in parts:
        s_trimmed = s.strip()
        if s_trimmed:
            result.append(s_trimmed)
    return result

def sentenceTokenize(text: str, pack: dict) -> list:
    return sentence_tokenize(text, pack)

def sera_transliterate(word: str, lang: str, pack: dict) -> str:
    """
    Transliterates Amharic to/from English using the SERA scheme.
    """
    if not word:
        return ""
    
    trans_word = ""
    sera_map = pack["transliteration"]["sera"]["map"]
    
    if lang == "am":
        for letter in word:
            if letter in sera_map:
                trans_word += sera_map[letter]
            elif is_punctuation_or_space(letter):
                trans_word += letter
    elif lang == "en":
        tokens = re.split(r"(\s+)", word)
        reverse_table = get_reverse_map(sera_map)
        
        for token in tokens:
            if not token:
                continue
            if token.isspace():
                trans_word += token
                continue
            
            sub_tokens = [token[i:i+2] for i in range(0, len(token), 2)]
            for letter in sub_tokens:
                en_letter = reverse_table.get(letter)
                if en_letter is not None:
                    trans_word += en_letter
                else:
                    for ltr in letter:
                        if is_punctuation_or_space(ltr):
                            trans_word += ltr
    return trans_word

def seraTransliterate(word: str, lang: str, pack: dict) -> str:
    return sera_transliterate(word, lang, pack)

def felig_transliterate(word: str, lang: str, pack: dict) -> str:
    """
    Transliterates Amharic to/from English using the Felig scheme.
    """
    if not word:
        return ""
        
    trans_word = ""
    felig_map = pack["transliteration"]["felig"]["map"]
    
    if lang == "am":
        for letter in word:
            if letter in felig_map:
                trans_word += felig_map[letter]
            elif is_punctuation_or_space(letter):
                trans_word += letter
    elif lang == "en":
        tokens = re.split(r"(\s+)", word)
        reverse_table = get_reverse_map(felig_map)
        
        for token in tokens:
            if not token:
                continue
            if token.isspace():
                trans_word += token
                continue
                
            sub_tokens = [token[i:i+2] for i in range(0, len(token), 2)]
            for letter in sub_tokens:
                if len(letter) == 2 and not re.match(r"[aeiou]", letter[0], re.I) and re.match(r"[aeiou]", letter[1], re.I):
                    if letter.startswith("W") and letter.endswith("a"):
                        am_letter = reverse_table.get(letter.lower())
                    else:
                        am_letter = reverse_table.get(letter)
                        
                    if am_letter is not None:
                        trans_word += am_letter
                    else:
                        for ltr in letter:
                            if is_punctuation_or_space(ltr):
                                trans_word += ltr
                else:
                    am_letter = ""
                    for ltr in letter:
                        found = reverse_table.get(ltr)
                        if found is not None:
                            am_letter += found
                        elif is_punctuation_or_space(ltr):
                            am_letter += ltr
                    if am_letter and am_letter != "ኧ":
                        trans_word += am_letter
                        
    return trans_word

def feligTransliterate(word: str, lang: str, pack: dict) -> str:
    return felig_transliterate(word, lang, pack)

def stem(word: str, pack: dict) -> str:
    """
    Takes an Amharic word and returns the stem through affix-removal with longest match.
    """
    if not word:
        return ""
        
    stemmer_config = pack.get("stemmer") or {}
    protected_words = stemmer_config.get("protected_words") or []
    
    if protected_words:
        if word in protected_words:
            return word
        prefixes = stemmer_config.get("prefixes") or []
        for prefix in prefixes:
            if word.startswith(prefix):
                stripped = word[len(prefix):]
                if stripped in protected_words:
                    return stripped
                    
    cv_string = felig_transliterate(word, "am", pack)
    
    sfx_arr = []
    
    suffixes = stemmer_config.get("suffixes") or []
    for suffix in suffixes:
        sfx_arr.append(felig_transliterate(suffix, "am", pack))
        if suffix.startswith("ዎ"):
            alt_suffix = "ኦ" + suffix[1:]
            sfx_arr.append(felig_transliterate(alt_suffix, "am", pack))
            
    sfx_arr.append("Wa")
    sfx_arr.sort(key=len, reverse=True)
    
    prefixes = stemmer_config.get("prefixes") or []
    pfx_arr = [felig_transliterate(pfx, "am", pack) for pfx in prefixes]
    pfx_arr.sort(key=len, reverse=True)
    
    # Remove suffixes
    for sfx in sfx_arr:
        if cv_string.endswith(sfx):
            cv_string = re.sub(rf"{re.escape(sfx)}$", "", cv_string, flags=re.I)
            break
            
    # Remove prefixes
    for pfx in pfx_arr:
        if cv_string.startswith(pfx):
            cv_string = re.sub(rf"^{re.escape(pfx)}", "", cv_string)
            break
            
    # Remove infixes
    if re.search(r".+([^aeiou])[aeiou]\1[aeiou].?", cv_string, re.I):
        cv_string = re.sub(r"\S\S[^aeiou][aeiou]", cv_string[0:2], cv_string, count=1, flags=re.I)
    elif re.search(r"^(.+)a\1$", cv_string, re.I):
        cv_string = re.sub(r"a.+", "", cv_string, count=1, flags=re.I)
        
    # CCV check
    ccv_match = re.search(r"[bcdfghjklmnpqrstvwxyz]{2}e", cv_string, re.I)
    if ccv_match:
        matched_str = ccv_match.group(0)
        replacement = matched_str[0] + "X" + matched_str[1:]
        cv_string = re.sub(r"[bcdfghjklmnpqrstvwxyz]{2}e", replacement, cv_string, count=1, flags=re.I)
        
    return felig_transliterate(cv_string, "en", pack)

def remove_stopwords(corpus: str, pack: dict) -> str:
    """
    Removes common stopwords from the input corpus.
    """
    if not corpus:
        return ""
        
    stopwords = pack.get("stopwords") or []
    sorted_stopwords = sorted(stopwords, key=len, reverse=True)
    
    result = corpus
    for word in sorted_stopwords:
        pattern = re.compile(
            rf"(^|[^\u1200-\u137F])(የ|በ|ከ|ለ|ስለ|የሚ|የማ)?({re.escape(word)})(ም|ን)?(?=[^\u1200-\u137F]|$)"
        )
        def replace_func(m):
            p1 = m.group(1) or ""
            p2 = m.group(2) or ""
            p4 = m.group(4) or ""
            return f"{p1}{p2}{p4}"
        result = pattern.sub(replace_func, result)
        
    return result

def removeStopwords(corpus: str, pack: dict) -> str:
    return remove_stopwords(corpus, pack)

def lex_analyze(corpus: str, pack: dict) -> str:
    """
    Preprocesses the corpus by expanding exceptions/abbreviations, and removing punctuation and numbers.
    """
    if not corpus:
        return ""
        
    tokenization = pack.get("tokenization") or {}
    exceptions = tokenization.get("exceptions") or {}
    
    for key, val in exceptions.items():
        expansion = " ".join(val)
        corpus = corpus.replace(key, expansion)
        
    # Replace punctuation
    corpus = re.sub(r"[.\?\"',/#!$%\^&\*;:፤።{}=\-_`~()]", " ", corpus)
    # Replace numbers
    corpus = re.sub(r"[.፩፪፫፬፭፮፯፰፱፲፳፴፵፶፷፸፹፺፻0123456789]", " ", corpus)
    # Collapse multiple spaces
    corpus = re.sub(r"\s{2,}", " ", corpus)
    
    return corpus

def lexAnalyze(corpus: str, pack: dict) -> str:
    return lex_analyze(corpus, pack)

def index_documents(docs: list, pack: dict) -> dict:
    """
    Indexes an array of documents, tracking term frequencies and word counts.
    """
    index_data = {
        "corpus_size": len(docs),
        "corpus_word_count": {},
        "words": {}
    }
    
    for doc in docs:
        doc_id = doc["id"]
        content = doc["content"]
        index_data["corpus_word_count"][doc_id] = len(content.split(" "))
        
        # Preprocess
        unstemmed = remove_stopwords(lex_analyze(content, pack), pack).split(" ")
        stemmed = [stem(w, pack) for w in unstemmed]
        result = [w for w in stemmed if w and len(w) > 1]
        
        # Index
        for word in result:
            if word in index_data["words"]:
                word_flag = 0
                for path_obj in index_data["words"][word]:
                    if doc_id in path_obj:
                        path_obj[doc_id] += 1
                        word_flag = 1
                        break
                if word_flag == 0:
                    index_data["words"][word].append({doc_id: 1})
            else:
                index_data["words"][word] = [{doc_id: 1}]
                
    return index_data

def indexDocuments(docs: list, pack: dict) -> dict:
    return index_documents(docs, pack)

def index_query(query: str, pack: dict) -> dict:
    """
    Preprocesses and indexes a single query string.
    """
    index_data = {
        "corpus_size": 1,
        "corpus_word_count": len(query.split(" ")),
        "words": {}
    }
    
    # Preprocess
    unstemmed = remove_stopwords(lex_analyze(query, pack), pack).split(" ")
    stemmed = [stem(w, pack) for w in unstemmed]
    result = [w for w in stemmed if w and len(w) > 1]
    
    # Index
    for word in result:
        if word in index_data["words"]:
            index_data["words"][word] += 1
        else:
            index_data["words"][word] = 1
            
    return index_data

def indexQuery(query: str, pack: dict) -> dict:
    return index_query(query, pack)

def weigh_terms(index: dict, type_of_index: str) -> dict:
    """
    Calculates TF-IDF weights for the given index.
    """
    weighted_terms = {}
    
    if type_of_index == "doc":
        corpus_size = index.get("corpus_size", 0)
        corpus_word_count = index.get("corpus_word_count", {})
        words = index.get("words", {})
        
        for word, doc_list in words.items():
            if doc_list:
                idf = math.log2(corpus_size / len(doc_list))
            else:
                idf = 0.0
                
            for path_obj in doc_list:
                file = list(path_obj.keys())[0]
                freq = list(path_obj.values())[0]
                
                word_count = corpus_word_count.get(file, 1)
                tf = freq / word_count
                tf_idf = idf * tf
                
                if word in weighted_terms:
                    weighted_terms[word].append({file: tf_idf})
                else:
                    weighted_terms[word] = [{file: tf_idf}]
                    
    elif type_of_index == "query":
        corpus_word_count = index.get("corpus_word_count", 1)
        words = index.get("words", {})
        
        for word, freq in words.items():
            tf = freq / corpus_word_count
            tf_idf = 1.0 * tf
            weighted_terms[word] = tf_idf
            
    return weighted_terms

def weighTerms(index: dict, type_of_index: str) -> dict:
    return weigh_terms(index, type_of_index)


# Symmetrical Pipeline Class API
class Pipeline:
    def __init__(self, pack: dict):
        self.pack = pack
        self.wasm_normalizer = None
        if _HAS_NATIVE and pack.get("normalization"):
            try:
                norm_config = pack["normalization"]
                self.wasm_normalizer = PyNormalizer(
                    norm_config.get("char_map") or {},
                    norm_config.get("labialized_map") or {},
                    norm_config.get("gemination_threshold")
                )
            except Exception:
                self.wasm_normalizer = None

    @property
    def stopwords(self) -> list:
        return self.pack.get("stopwords") or []

    # JS/CamelCase API
    def normalize(self, text: str) -> str:
        if not text:
            return ""
        if self.wasm_normalizer:
            try:
                return self.wasm_normalizer.normalize(text)
            except Exception:
                pass
        return normalize(text, self.pack)

    def sentenceTokenize(self, text: str) -> list:
        return sentence_tokenize(text, self.pack)

    def stem(self, word: str) -> str:
        return stem(word, self.pack)

    def removeStopwords(self, corpus: str) -> str:
        return remove_stopwords(corpus, self.pack)

    def lexAnalyze(self, corpus: str) -> str:
        return lex_analyze(corpus, self.pack)

    def feligTransliterate(self, word: str, lang: str) -> str:
        return felig_transliterate(word, lang, self.pack)

    def seraTransliterate(self, word: str, lang: str) -> str:
        return sera_transliterate(word, lang, self.pack)

    def indexDocuments(self, docs: list) -> dict:
        return index_documents(docs, self.pack)

    def indexQuery(self, query: str) -> dict:
        return index_query(query, self.pack)

    def weighTerms(self, index: dict, type_of_index: str) -> dict:
        return weigh_terms(index, type_of_index)

    # Pythonic/SnakeCase API
    def sentence_tokenize(self, text: str) -> list:
        return self.sentenceTokenize(text)

    def remove_stopwords(self, corpus: str) -> str:
        return self.removeStopwords(corpus)

    def lex_analyze(self, corpus: str) -> str:
        return self.lexAnalyze(corpus)

    def felig_transliterate(self, word: str, lang: str) -> str:
        return self.feligTransliterate(word, lang)

    def sera_transliterate(self, word: str, lang: str) -> str:
        return self.seraTransliterate(word, lang)

    def index_documents(self, docs: list) -> dict:
        return self.indexDocuments(docs)

    def index_query(self, query: str) -> dict:
        return self.indexQuery(query)

    def weigh_terms(self, index: dict, type_of_index: str) -> dict:
        return self.weighTerms(index, type_of_index)
