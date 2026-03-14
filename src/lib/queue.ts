import OpenAI from "openai";

type QueueItem = {
  articles: any[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

class OpenAISummaryQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private readonly DELAY_BETWEEN_REQUESTS = 1000; // 1 seconde

  async add(articles: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ articles, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      try {
        // Faire l'appel à OpenAI ici avec un délai
        const result = await this.callOpenAI(item.articles);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Attendre avant la prochaine requête
      await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
    }
    
    this.processing = false;
  }

  private async callOpenAI(articles: any[]) {
    // Votre logique d'appel à OpenAI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const text = articles
      .map(
        (a: any, i: number) =>
          `Article ${i + 1}:
Titre: ${a.title}
Description: ${a.description || "Aucune description"}
Source: ${a.feedTitle || "Inconnue"}
URL: ${a.link}`
      )
      .join("\n\n");

    const prompt = `...`; // Votre prompt existant

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content;
  }
}

export const summaryQueue = new OpenAISummaryQueue();