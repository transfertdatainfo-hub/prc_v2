// Fonction de filtrage (placeholder)
import { Article } from "@/types/Article"


export function filterArticles(articles: Article[], filters: any) {

    let result = [...articles];
    
    
    // Détection basique de la langue
      const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
      const isFrench = (text: string) => /[éèêàùçîô]/i.test(text);
      const isEnglish = (text: string) => /^[\x00-\x7F]*$/.test(text); // ASCII = souvent anglais
    
      // Detection basique des catégories
      const isPolitique = (text: string) =>
        /(politique|gouvernement|élection|député|ministre)/i.test(text);
      const isGuerre = (text: string) =>
        /(guerre|armée|conflit|attaque|bombardement)/i.test(text);
      const isEconomie = (text: string) =>
        /(économie|finance|marché|bourse|inflation)/i.test(text);
    
      // Détection des intérêts géographiques et financiers
      const matchCanada = (text: string) =>
        /(canada|ottawa|canadien|canadienne|trudeau)/i.test(text);
      const matchQuebec = (text: string) =>
        /(québec|quebec|québécois|québécoise|montréal|montreal|legault)/i.test(
          text,
        );
      const matchTunisia = (text: string) =>
        /(tunisie|tunisien|tunisienne|tunis|sfax|sousse|mahdia|bizerte|gabès|gabes)/i.test(
          text,
        );
      const matchPortfolio = (text: string) =>
        /(bourse|marché|finance|portefeuille|investissement|actions|obligations|nasdaq|tsx|dow jones)/i.test(
          text,
        );
  
    // Filtre langue
    if (filters.language) {
      result = result.filter((a) => {
        const text = `${a.title} ${a.description || ""}`;

        if (filters.language === "ar") return isArabic(text);
        if (filters.language === "fr") return isFrench(text);
        if (filters.language === "en") return isEnglish(text);

        return true;
      });
    }
    // Filtre catégorie
    if (filters.category) {
      result = result.filter((a) => {
        const text = `${a.title} ${a.description || ""}`;

        if (filters.category === "politique") return isPolitique(text);
        if (filters.category === "guerre") return isGuerre(text);
        if (filters.category === "economie") return isEconomie(text);

        return true;
      });
    }

    // Filtre "Mes intérêts"
    if (
      filters.canada ||
      filters.quebec ||
      filters.tunisia ||
      filters.portfolio
    ) {
      result = result.filter((a) => {
        const text = `${a.title} ${a.description || ""}`.toLowerCase();

        if (filters.canada && matchCanada(text)) return true;
        if (filters.quebec && matchQuebec(text)) return true;
        if (filters.tunisia && matchTunisia(text)) return true;
        if (filters.portfolio && matchPortfolio(text)) return true;

        return false;
      });
    }

  return result;
}
