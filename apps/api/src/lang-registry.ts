import type { LanguagePack } from "@fidel-tools/core";
import { Pipeline } from "@fidel-tools/core";

// Cache for language packs and pipeline instances
const packCache = new Map<string, LanguagePack>();
const pipelineCache = new Map<string, Pipeline>();

// Registry of available packs - loaded lazily
const PACK_REGISTRY: Record<string, () => Promise<LanguagePack>> = {
  am: () => import("@fidel-tools/lang-am").then((m) => m.default),
};

export const SUPPORTED_LANGS = Object.keys(PACK_REGISTRY); // ["am"]

export async function getPack(lang: string): Promise<LanguagePack> {
  if (packCache.has(lang)) {
    return packCache.get(lang)!;
  }

  if (!PACK_REGISTRY[lang]) {
    throw new Error(
      `Language "${lang}" is not supported. Available: ${SUPPORTED_LANGS.join(", ")}`,
    );
  }

  const pack = await PACK_REGISTRY[lang]();
  packCache.set(lang, pack);
  return pack;
}

export async function getPipeline(lang: string): Promise<Pipeline> {
  if (pipelineCache.has(lang)) {
    return pipelineCache.get(lang)!;
  }

  const pack = await getPack(lang);
  const pipeline = new Pipeline(pack);
  pipelineCache.set(lang, pipeline);
  return pipeline;
}
