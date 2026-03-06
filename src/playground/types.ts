import type { PlaygroundUtilDefinition } from "../runtime/composables/definePlaygroundUtil";

export interface PlaygroundUtilRecord extends PlaygroundUtilDefinition {
  id: string;
  name: string;
  description?: string;
  order: number;
  file: string;
  componentName?: string;
}

export interface PlaygroundRuntimeConfig {
  srcDir?: string;
  srcDirs?: string[];
  utils?: PlaygroundUtilRecord[];
}

