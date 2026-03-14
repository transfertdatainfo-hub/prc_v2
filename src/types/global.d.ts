// Déclaration globale pour stocker les résumés en mémoire

declare global {
  // eslint-disable-next-line no-var
  var summaryStore: Map<string, string> | undefined;
}

export {};
