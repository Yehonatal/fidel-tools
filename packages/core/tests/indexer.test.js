import { Pipeline } from "../dist/pipeline.js";
import { indexDocuments, indexQuery } from "../dist/indexer.js";
import { weighTerms } from "../dist/term_weighter.js";
import fs from "fs";
import { resolve } from "path";

const amPack = JSON.parse(fs.readFileSync(resolve(__dirname, "../../lang-am/am.json"), "utf8"));

describe("Amharic Indexer & Term Weighter", () => {
  const pipeline = new Pipeline(amPack);

  const sampleDocs = [
    { id: "doc1", content: "ሐኪም ኀይሉ መጽሐፍ ገዛ" },
    { id: "doc2", content: "መጽሐፍ ማንበብ ጥሩ ነው" },
  ];

  test("indexes documents correctly", () => {
    const docIndex = indexDocuments(sampleDocs, amPack);

    expect(docIndex.corpus_size).toBe(2);
    expect(docIndex.corpus_word_count["doc1"]).toBe(4);
    expect(docIndex.corpus_word_count["doc2"]).toBe(4);

    // Words should have index entry lists
    expect(docIndex.words).toHaveProperty("መህኧፍ");
    expect(docIndex.words["መህኧፍ"]).toBeInstanceOf(Array);
  });

  test("indexes query correctly", () => {
    const queryIndex = indexQuery("መጽሐፍ ገዛ", amPack);

    expect(queryIndex.corpus_size).toBe(1);
    expect(queryIndex.corpus_word_count).toBe(2);
    expect(queryIndex.words).toHaveProperty("መህኧፍ");
    expect(queryIndex.words["መህኧፍ"]).toBe(1);
  });

  test("weighs document terms correctly using TF-IDF", () => {
    const docIndex = indexDocuments(sampleDocs, amPack);
    const weighted = weighTerms(docIndex, "doc");

    expect(weighted).toHaveProperty("መህኧፍ");
    expect(weighted["መህኧፍ"]).toBeInstanceOf(Array);
  });

  test("weighs query terms correctly", () => {
    const queryIndex = indexQuery("መጽሐፍ ገዛ", amPack);
    const weighted = weighTerms(queryIndex, "query");

    expect(weighted).toHaveProperty("መህኧፍ");
    expect(typeof weighted["መህኧፍ"]).toBe("number");
  });

  test("pipeline wrappers execute correctly", () => {
    const docIndex = pipeline.indexDocuments(sampleDocs);
    expect(docIndex.corpus_size).toBe(2);

    const queryIndex = pipeline.indexQuery("መጽሐፍ");
    expect(queryIndex.corpus_size).toBe(1);

    const weighted = pipeline.weighTerms(docIndex, "doc");
    expect(weighted).toHaveProperty("መህኧፍ");
  });

  test("pipeline handles empty/invalid inputs gracefully", () => {
    const emptyDocIndex = pipeline.indexDocuments([]);
    expect(emptyDocIndex.corpus_size).toBe(0);
    expect(emptyDocIndex.words).toEqual({});

    const nullDocIndex = pipeline.indexDocuments(null);
    expect(nullDocIndex.corpus_size).toBe(0);
    expect(nullDocIndex.words).toEqual({});

    const emptyQueryIndex = pipeline.indexQuery("");
    expect(emptyQueryIndex.corpus_size).toBe(0);
    expect(emptyQueryIndex.words).toEqual({});

    const nullQueryIndex = pipeline.indexQuery(null);
    expect(nullQueryIndex.corpus_size).toBe(0);
    expect(nullQueryIndex.words).toEqual({});

    const nullWeigh = pipeline.weighTerms(null, "doc");
    expect(nullWeigh).toBeNull();
  });
});
