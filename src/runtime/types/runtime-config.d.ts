export {};

interface PlaygroundUtilRuntimeRecord {
  id: string;
  name: string;
  description?: string;
  order: number;
  file: string;
  componentName?: string;
}

interface PlaygroundUtilsRuntimeConfig {
  srcDir?: string;
  srcDirs?: string[];
  utils?: PlaygroundUtilRuntimeRecord[];
}

declare module "nuxt/schema" {
  interface RuntimeConfig {
    playgroundUtils?: PlaygroundUtilsRuntimeConfig;
  }

  interface PublicRuntimeConfig {
    playgroundUtils?: PlaygroundUtilsRuntimeConfig;
  }
}

declare module "@nuxt/schema" {
  interface RuntimeConfig {
    playgroundUtils?: PlaygroundUtilsRuntimeConfig;
  }

  interface PublicRuntimeConfig {
    playgroundUtils?: PlaygroundUtilsRuntimeConfig;
  }
}
