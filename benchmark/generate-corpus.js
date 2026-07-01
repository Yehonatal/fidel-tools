import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corpusDir = path.resolve(__dirname, 'corpus');
if (!fs.existsSync(corpusDir)) {
  fs.mkdirSync(corpusDir, { recursive: true });
}

// ----------------------------------------------------
// 1. Normalization Corpus Generation
// ----------------------------------------------------
const normalizationBases = [
  { text: "ሃኪም ሃይሉ ሄደ።", category: "homophones" },
  { text: "ፀሃይ በምስራቅ ትወጣለች።", category: "homophones" },
  { text: "አሊ ወደ ገርጂ ሄደ።", category: "homophones" },
  { text: "ፀሎትና ትህትና", category: "homophones" },
  { text: "ንጉሱ በቤተ መንግስት ነው።", category: "homophones" },
  { text: "ልጁ በልቱዋል ሙዋች ቤተሰብም አለ።", category: "labialization" },
  { text: "ዶሮዋ ሮጣ ቱዋለች።", category: "labialization" },
  { text: "ወንበሩ ላይ ተቀምጦ መጽሃፍ ያነባል።", category: "homophones" },
  { text: "ስራው በጣም ከባድ ቢሆንም ተጠናቆአል።", category: "homophones" },
  { text: "ትምህርት ቤት እና መስሪያ ቤት ተዘግተዋል።", category: "homophones" },
  { text: "እባክህ በጣም አመሰግናለሁ።", category: "clean" },
  { text: "አዲስ አበባ ትልቅ ከተማ ናት።", category: "clean" },
  { text: "አንድ ሁለት ሶስት አራት አምስት", category: "clean" },
  { text: "ኢትዮጵያ ታሪካዊና ውብ ሃገር ናት።", category: "clean" },
  { text: "ቋንቋችንን ማሳደግና መንከባከብ አለብን።", category: "clean" }
];

const homophonesPerturb = {
  'ሃ': ['ሀ', 'ሐ', 'ኀ'],
  'ሰ': ['ሠ'],
  'አ': ['ዐ'],
  'ፀ': ['ጸ']
};

const labializationPerturb = {
  'ሉዋ': 'ሏ', 'ሙዋ': 'ሟ', 'ሩዋ': 'ሯ', 'ሱዋ': 'ሷ', 'ሹዋ': 'ሿ',
  'ቁዋ': 'ቋ', 'ቡዋ': 'ቧ', 'ቱዋ': 'ቷ', 'ቹዋ': 'ቿ', 'ኑዋ': 'ኗ',
  'ዟ': 'ዟ', 'ዧ': 'ዧ', 'ዱዋ': 'ዷ', 'ጁዋ': 'ጇ', 'ጡዋ': 'ጧ',
  'ጩዋ': 'ጯ', 'ጹዋ': 'ጿ', 'ፉዋ': 'ፏ', 'ሁዋ': 'ኋ'
};

function generateNormalizationCorpus() {
  console.log('Generating independent normalization corpus...');
  const corpus = [];
  
  for (let i = 0; i < 2000; i++) {
    const base = normalizationBases[i % normalizationBases.length];
    let text = base.text;
    let actualCategory = base.category;
    
    // Perturb homophones if the base category is homophones, or randomly in general
    if (base.category === "homophones" || Math.random() < 0.5) {
      for (const [norm, raws] of Object.entries(homophonesPerturb)) {
        if (text.includes(norm)) {
          const raw = raws[Math.floor(Math.random() * raws.length)];
          text = text.replaceAll(norm, raw);
        }
      }
    }
    
    // Perturb labialization
    if (base.category === "labialization" || Math.random() < 0.5) {
      for (const [norm, raw] of Object.entries(labializationPerturb)) {
        if (text.includes(norm)) {
          text = text.replaceAll(norm, raw);
        }
      }
    }
    
    // Add artificial gemination to introduce gemination noise
    if (Math.random() < 0.3) {
      actualCategory = "gemination";
      let geminatedText = "";
      for (const char of text) {
        if (char.match(/[^\s።፡?!.]/) && Math.random() < 0.2) {
          const repeatCount = 3 + Math.floor(Math.random() * 3);
          geminatedText += char.repeat(repeatCount);
        } else {
          geminatedText += char;
        }
      }
      text = geminatedText;
    }
    
    corpus.push({
      input: text,
      expected: base.text,
      category: actualCategory
    });
  }
  
  const filePath = path.join(corpusDir, 'normalization.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

// ----------------------------------------------------
// 2. Stemming Corpus Generation
// ----------------------------------------------------
const stemmingBases = [
  // Regular nouns/verbs
  { word: "ልጅ", category: "regular" },
  { word: "ቤት", category: "regular" },
  { word: "ትምህርት", category: "regular" },
  { word: "ሃገር", category: "regular" },
  { word: "መጽሃፍ", category: "regular" },
  { word: "ከተማ", category: "regular" },
  { word: "ሰው", category: "regular" },
  { word: "ቋንቋ", category: "regular" },
  { word: "ስራ", category: "regular" },
  { word: "ወንበር", category: "regular" },
  { word: "ውል", category: "regular" },
  { word: "ጎረቤት", category: "regular" },
  { word: "ቅጠል", category: "regular" },
  { word: "ወጥ", category: "regular" },
  
  // Irregular/Protected
  { word: "ኢትዮጵያ", category: "irregular" },
  { word: "አፍሪካ", category: "irregular" },
  { word: "አዲስ አበባ", category: "irregular" },
  { word: "ንከባከበ", category: "irregular" },
  { word: "ዳቦ", category: "irregular" },
  
  // Ambiguous (where prefix/suffix removal results in incorrect stem)
  { word: "በላ", category: "ambiguous" },
  { word: "ደብዳቤ", category: "ambiguous" },
  { word: "ከፈለ", category: "ambiguous" },
  { word: "ከሰረ", category: "ambiguous" },
  { word: "አደረገ", category: "ambiguous" },
  { word: "በለጠ", category: "ambiguous" },
  { word: "ለመለመ", category: "ambiguous" },
  { word: "ሰደበ", category: "ambiguous" }
];

const prefixes = ["የ", "በ", "ከ", "ለ", "ስለ", "የሚ", "የማ", ""];
const suffixes = ["ዎች", "ኝ", "ችን", "ቸው", "ቸውን", "ታል", ""];

function generateStemmingCorpus() {
  console.log('Generating independent stemming corpus...');
  const corpus = [];
  
  for (let i = 0; i < 2000; i++) {
    const base = stemmingBases[i % stemmingBases.length];
    let prefix = "";
    let suffix = "";
    
    // Only apply affixes for regular or ambiguous words randomly
    if (base.category !== "irregular" || Math.random() < 0.3) {
      prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    const inflected = prefix + base.word + suffix;
    
    corpus.push({
      input: inflected,
      expected: base.word,
      category: base.category
    });
  }
  
  const filePath = path.join(corpusDir, 'stemming.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

// ----------------------------------------------------
// 3. Tokenization Corpus Generation
// ----------------------------------------------------
const tokenizationBases = [
  { text: "ሃኪም ሃይሉ ሄደ", category: "standard" },
  { text: "ልጁ በልቱዋል ሙዋች ቤተሰብም አለ", category: "standard" },
  { text: "እባክህ በጣም አመሰግናለሁ", category: "standard" },
  { text: "አዲስ አበባ ትልቅ ከተማ ናት", category: "standard" },
  { text: "ዶክተር አበበ ዛሬ ይመጣል", category: "standard" },
  { text: "ጠቅላይ ሚኒስትሩ አዲስ ውሳኔ አስተላለፉ", category: "standard" },
  { text: "ከተማዋ በጣም ቆንጆ እና ትልቅ ናት", category: "standard" },
  
  // Word Separator (hulet neteb ፡)
  { text: "ልጁ፡በልቷል፡ሟች፡ቤተሰብም፡አለ", category: "word_separator" },
  { text: "አዲስ፡አበባ፡ትልቅ፡ከተማ፡ናት", category: "word_separator" },
  
  // Abbreviations (should not split sentences inside them)
  { text: "ት/ቤት ዛሬ ተዘግቷል", category: "abbreviation" },
  { text: "ወ/ሮ ማርቱ በኢትዮጵያ ይኖራሉ", category: "abbreviation" },
  { text: "ጠ/ሚ አዲስ ውሳኔ አስተላለፉ", category: "abbreviation" }
];

const boundaries = ['።', '?', '!', '.'];

function generateTokenizationCorpus() {
  console.log('Generating independent tokenization corpus...');
  const corpus = [];
  
  for (let i = 0; i < 2000; i++) {
    const numSentences = 1 + Math.floor(Math.random() * 3); // 1 to 3 sentences
    const selectedBases = [];
    const expected = [];
    let dominantCategory = "standard";
    
    for (let j = 0; j < numSentences; j++) {
      const base = tokenizationBases[(i * 3 + j) % tokenizationBases.length];
      selectedBases.push(base.text);
      expected.push(base.text);
      if (base.category !== "standard") {
        dominantCategory = base.category;
      }
    }
    
    // Join sentences with random boundaries
    let text = "";
    for (let k = 0; k < selectedBases.length; k++) {
      const bound = boundaries[Math.floor(Math.random() * boundaries.length)];
      text += selectedBases[k] + bound + " ";
    }
    text = text.trim();
    
    corpus.push({
      input: text,
      expected: expected,
      category: dominantCategory
    });
  }
  
  const filePath = path.join(corpusDir, 'tokenization.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

generateNormalizationCorpus();
generateStemmingCorpus();
generateTokenizationCorpus();
console.log('All non-circular test corpora generated successfully!');
