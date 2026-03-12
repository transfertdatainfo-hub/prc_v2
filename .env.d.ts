declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    EMAIL_SERVER_HOST: string;
    EMAIL_SERVER_PORT: string;
    EMAIL_SERVER_USER: string;
    EMAIL_SERVER_PASSWORD: string;
    EMAIL_FROM: string;
    NEWS_API_KEY: string;
    MARKET_API_KEY: string;
    NODE_ENV: "development" | "production" | "test";
  }
}
