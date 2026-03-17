
import { Filters } from "./Filters";

export type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  viewMode?: "category" | "all" | "feeds";
  mediaOptions?: { value: string; label: string }[];
};