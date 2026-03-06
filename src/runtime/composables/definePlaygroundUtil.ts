export interface PlaygroundUtilDefinition {
  /**
   * Stable identifier used in the UI URL and selection state.
   */
  id?: string;
  /**
   * Human readable utility name shown in Nuxt DevTools.
   */
  name: string;
  /**
   * Optional short description displayed in the list.
   */
  description?: string;
  /**
   * Optional sorting index (lower comes first).
   */
  order?: number;
  /**
   * Icon name to use as the util button
   */
  icon?: string;
}

export function definePlaygroundUtil(definition: PlaygroundUtilDefinition) {
  return definition;
}
