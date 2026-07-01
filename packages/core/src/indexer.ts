import stem from "./stemmer.js";
import lexAnalyze from "./lexical_analyzer.js";
import rmvStopwrd from "./stopword_remover.js";
import type { LanguagePack } from "./types.js";

// Pure interfaces — no fs
export interface DocIndexData {
  corpus_size: number;
  corpus_word_count: Record<string, number>;
  words: Record<string, Array<Record<string, number>>>;
}

export interface QueryIndexData {
  corpus_size: number;
  corpus_word_count: number;
  words: Record<string, number>;
}

// Pure functions — no fs dependency
export function indexDocuments(
  docs: Array<{ id: string; content: string }>,
  pack: LanguagePack,
): DocIndexData {
  const indexData: DocIndexData = {
    corpus_size: docs.length,
    corpus_word_count: {},
    words: {},
  };

  docs.forEach((doc) => {
    indexData.corpus_word_count[doc.id] = doc.content.split(" ").length;

    // preprocess
    const unStemmedWords = rmvStopwrd(lexAnalyze(doc.content, pack), pack).split(" ");
    const stemmedWords = unStemmedWords.map((word) => stem(word, pack));
    const result = stemmedWords
      .filter((e) => e)
      .filter((e) => {
        return e.length > 1;
      });

    // index
    let wordFlag = 0;
    result.forEach((word) => {
      if (word in indexData.words) {
        indexData.words[word].forEach((pathObj) => {
          if (doc.id in pathObj) {
            pathObj[doc.id]++;
            wordFlag = 1;
          }
        });
        if (wordFlag === 0) {
          indexData.words[word].push({ [doc.id]: 1 });
        } else {
          wordFlag = 0;
        }
      } else {
        indexData.words[word] = [{ [doc.id]: 1 }];
      }
    });
  });

  return indexData;
}

export function indexQuery(query: string, pack: LanguagePack): QueryIndexData {
  const indexData: QueryIndexData = {
    corpus_size: 1,
    corpus_word_count: query.split(" ").length,
    words: {},
  };

  // preprocess
  const unStemmedWords = rmvStopwrd(lexAnalyze(query, pack), pack).split(" ");
  const stemmedWords = unStemmedWords.map((word) => stem(word, pack));
  const result = stemmedWords
    .filter((e) => e)
    .filter((e) => {
      return e.length > 1;
    });

  // index
  result.forEach((word) => {
    if (word in indexData.words) {
      indexData.words[word]++;
    } else {
      indexData.words[word] = 1;
    }
  });

  return indexData;
}

// Backwards-compat Node.js wrapper — fs lives here only
export async function indexTerms(
  corpus: string[],
  outputIndexFilePath: string,
  type: "doc" | "query",
  pack: LanguagePack,
): Promise<void> {
  const fs = await import("fs");
  if (type === "doc") {
    const docs = corpus.map((filePath) => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        return { id: filePath, content };
      } catch (error) {
        console.log(`Error reading ${filePath} file from disk:`, error);
        return { id: filePath, content: "" };
      }
    });
    const result = indexDocuments(docs, pack);
    try {
      fs.writeFileSync(outputIndexFilePath + "/docIndexFile.json", JSON.stringify(result, null, 2));
      docs.forEach((doc) => {
        console.log(`Contents of ${doc.id} successfully added to index`);
      });
    } catch (error) {
      console.log("Index creation failed", error);
    }
  } else {
    try {
      const result = indexQuery(corpus as unknown as string, pack);
      fs.writeFileSync(
        outputIndexFilePath + "/queryIndexFile.json",
        JSON.stringify(result, null, 2),
      );
      console.log(`Contents of Query successfully added to index`);
    } catch (error) {
      console.log("Index creation failed", error);
    }
  }
}

export default indexTerms;
