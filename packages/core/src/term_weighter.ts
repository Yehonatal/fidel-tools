import type { DocIndexData, QueryIndexData } from "./indexer.js";

// Pure function — no fs
export function weighTerms(
  index: DocIndexData | QueryIndexData,
  type: "doc" | "query",
): Record<string, any> {
  const weightedTerms: Record<string, any> = {};

  if (type === "doc") {
    const dataset = index as DocIndexData;
    let tf = 0;
    let idf = 0;
    let tf_idf = 0;

    // calculate length normalized term frequency and inverse document frequency
    Object.keys(dataset.words).forEach((word) => {
      idf = Math.log2(dataset.corpus_size / dataset.words[word].length);

      dataset.words[word].forEach((filePathObj: Record<string, number>) => {
        let file = Object.keys(filePathObj)[0];
        let freq = Object.values(filePathObj)[0];

        tf = freq / dataset.corpus_word_count[file];
        tf_idf = idf * tf;

        // modify weighted_terms object
        if (word in weightedTerms) {
          weightedTerms[word].push({ [file]: tf_idf });
        } else {
          weightedTerms[word] = [{ [file]: tf_idf }];
        }
      });
    });
  } else if (type === "query") {
    const dataset = index as QueryIndexData;
    let tf = 0;
    let idf = 1;
    let tf_idf = 0;

    // calculate length normalized term frequency and inverse document frequency
    Object.keys(dataset.words).forEach((word) => {
      let freq = dataset.words[word];

      tf = freq / dataset.corpus_word_count;
      tf_idf = idf * tf;

      weightedTerms[word] = tf_idf;
    });
  }

  return weightedTerms;
}

// Backwards-compat Node.js wrapper
export async function weigh_terms(
  indexFilePath: string,
  outputWeightedTermsPath: string,
  typeOfIndex: "doc" | "query",
): Promise<void> {
  const fs = await import("fs");
  const weightedTermsPath = outputWeightedTermsPath + `/${typeOfIndex}WeightedTermsFile.json`;

  // read index file
  try {
    const jsonString = fs.readFileSync(indexFilePath, "utf8");
    try {
      const dataset = JSON.parse(jsonString);
      const result = weighTerms(dataset, typeOfIndex);

      // output to file
      const outJsonString = JSON.stringify(result, null, 2);

      try {
        fs.writeFileSync(weightedTermsPath, outJsonString);
        console.log(`Indexed terms successfully weighted`);
      } catch (error) {
        console.log("Weighted terms creation failed", error);
      }
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  } catch (error) {
    console.log(`Error reading Index file ${indexFilePath} from disk:`, error);
  }
}

export default weigh_terms;
