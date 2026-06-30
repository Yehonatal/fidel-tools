import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalize, sentenceTokenize, stem } from '../packages/core/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const amPackPath = path.resolve(__dirname, '../packages/lang-am/am.json');
const amPack = JSON.parse(fs.readFileSync(amPackPath, 'utf8'));

const corpusDir = path.resolve(__dirname, 'corpus');
if (!fs.existsSync(corpusDir)) {
  fs.mkdirSync(corpusDir, { recursive: true });
}

const baseSentences = [
  "ሐኪም ኀይሉ ሄደ።",
  "ልጁ በልቷል ሟች ቤተሰብም አለ።",
  "እባክህህህህ በጣምምምምም አመሰግናለሁህህህ።",
  "አዲስ አበባ ትልቅ ከተማ ናት።",
  "አንድ ሁለት ሦስት አራት አምስት",
  "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!",
  "የገንዘብ ሚኒስቴር ምክር ቤት አዋጅ አወጣ።",
  "ትምህርት ቤት እና መሥሪያ ቤት ተዘግተዋል።",
  "ዶክተር አበበ ዛሬ ይመጣል።",
  "ጠቅላይ ሚኒስትሩ አዲስ ውሳኔ አስተላለፉ።",
  "ወይዘሮ ማርቱ በኢትዮጵያ ውስጥ ይኖራሉ።",
  "ከተማዋ በጣም ቆንጆ እና ትልቅ ናት።",
  "በአሁኑ ጊዜ በዓለም ላይ ብዙ ለውጦች አሉ።",
  "የአየር ንብረት ለውጥ ትልቅ አደጋ ነው።",
  "ስራው በጣም ከባድ ቢሆንም ተጠናቋል።",
  "ልጆቹ በደስታ ወደ ትምህርት ቤት ሄዱ።",
  "ሁሉም ሰው በጋራ መስራት አለበት።",
  "ኢትዮጵያ ታሪካዊና ውብ ሀገር ናት።",
  "ቋንቋችንን ማሳደግና መንከባከብ አለብን።",
  "ወንበሩ ላይ ተቀምጦ መጽሐፍ ያነባል።"
];

// Helper to get inverse homophones
const homophonesMap = {
  'ሃ': ['ሀ', 'ሐ', 'ኀ'],
  'ሰ': ['ሠ'],
  'አ': ['ዐ'],
  'ፀ': ['ጸ']
};

const labializedRevMap = {
  'ሉዋ': 'ሏ', 'ሙዋ': 'ሟ', 'ሩዋ': 'ሯ', 'ሱዋ': 'ሷ', 'ሹዋ': 'ሿ',
  'ቁዋ': 'ቋ', 'ቡዋ': 'ቧ', 'ቱዋ': 'ቷ', 'ቹዋ': 'ቿ', 'ኑዋ': 'ኗ',
  'ዙዋ': 'ዟ', 'ዡዋ': 'ዧ', 'ዱዋ': 'ዷ', 'ጁዋ': 'ጇ', 'ጡዋ': 'ጧ',
  'ጩዋ': 'ጯ', 'ጹዋ': 'ጿ', 'ፉዋ': 'ፏ', 'ሁዋ': ['ኋ', 'ሗ']
};

function generateNormalizationCorpus() {
  console.log('Generating normalization corpus...');
  const corpus = [];
  
  for (let i = 0; i < 2000; i++) {
    const base = baseSentences[i % baseSentences.length];
    let text = '';
    
    // Add variations per character
    for (let char of base) {
      const rand = Math.random();
      if (rand < 0.15 && homophonesMap[char]) {
        // Map to a random un-normalized homophone
        const options = homophonesMap[char];
        text += options[Math.floor(Math.random() * options.length)];
      } else if (rand < 0.3 && char.match(/[^\s]/)) {
        // Add artificial gemination (repeat 3-5 times)
        const repeatCount = 3 + Math.floor(Math.random() * 3);
        text += char.repeat(repeatCount);
      } else {
        text += char;
      }
    }
    
    // Periodically replace labialized pairs with single characters or vice-versa
    for (let [normalized, raw] of Object.entries(labializedRevMap)) {
      if (Math.random() < 0.2) {
        const rawChar = Array.isArray(raw) ? raw[0] : raw;
        text = text.replaceAll(normalized, rawChar);
      }
    }
    
    const expected = normalize(text, amPack);
    corpus.push({ input: text, expected });
  }
  
  const filePath = path.join(corpusDir, 'normalization.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

function generateTokenizationCorpus() {
  console.log('Generating tokenization corpus...');
  const corpus = [];
  const abbreviations = ['ት/ቤት', 'ወ/ሮ', 'ጠ/ሚ', 'ዶ/ር', 'ሀ/ማርያም', 'ህ/ሰብ', 'ጠ/ፍ/ቤት'];
  const boundaries = ['።', '፡', '?', '!', '.'];
  
  for (let i = 0; i < 2000; i++) {
    const numSentences = 1 + Math.floor(Math.random() * 4); // 1 to 4 sentences
    const sentences = [];
    const expected = [];
    
    for (let j = 0; j < numSentences; j++) {
      let base = baseSentences[(i * 3 + j) % baseSentences.length];
      
      // Strip end punctuation if any
      base = base.replace(/[።፡?!.]$/, '');
      
      // Inject abbreviations periodically
      if (Math.random() < 0.3) {
        const abbr = abbreviations[Math.floor(Math.random() * abbreviations.length)];
        const insertPos = Math.floor(Math.random() * 3);
        if (insertPos === 0) {
          base = abbr + ' ' + base;
        } else {
          base = base + ' ' + abbr;
        }
      }
      
      sentences.push(base);
      // Expected individual sentence output is normalized / trimmed
      const cleanExpected = base.trim();
      if (cleanExpected) {
        expected.push(cleanExpected);
      }
    }
    
    // Join with random boundaries
    let text = '';
    for (let k = 0; k < sentences.length; k++) {
      const bound = boundaries[Math.floor(Math.random() * boundaries.length)];
      text += sentences[k] + bound + ' ';
    }
    text = text.trim();
    
    const runResult = sentenceTokenize(text, amPack);
    corpus.push({ input: text, expected: runResult });
  }
  
  const filePath = path.join(corpusDir, 'tokenization.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

const amhTestWords = [
  "ወንበር", "ልጅ", "ቤት", "ውል", "ጎረቤት", "ፈለገ", "ሠደበ", "ቀደደ", "ሸፈነ",
  "ቅጠል", "ወጥ", "ለወጥ", "በላ", "መከረ", "ትብኢት", "ፎከረ", "መሠለ",
  "ንከባከበ", "ተከል", "መንከባከብ", "ጠቢብ", "ጠባብ", "ትምህርት", "ኢትዮጵያ", "ዳቦ"
];

function generateStemmingCorpus() {
  console.log('Generating stemming corpus...');
  const corpus = [];
  const prefixes = ["የ", "በ", "ከ", "ለ", "ስለ", "የሚ", "የማ", ""];
  const suffixes = ["ዎች", "ኝ", "ችን", "ቸው", "ቸውን", "ታል", ""];
  
  let count = 0;
  while (count < 2000) {
    const base = amhTestWords[count % amhTestWords.length];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const inflected = prefix + base + suffix;
    const expected = stem(inflected, amPack);
    
    if (inflected && expected) {
      corpus.push({ input: inflected, expected });
      count++;
    }
  }
  
  const filePath = path.join(corpusDir, 'stemming.jsonl');
  const writeStream = fs.createWriteStream(filePath);
  corpus.forEach(item => {
    writeStream.write(JSON.stringify(item) + '\n');
  });
  writeStream.end();
  console.log(`Saved ${corpus.length} entries to ${filePath}`);
}

generateNormalizationCorpus();
generateTokenizationCorpus();
generateStemmingCorpus();
console.log('All test corpora generated successfully!');
