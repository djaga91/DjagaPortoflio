import { create } from "zustand";

import type { GameState } from "./types";
import { createAuthSlice } from "./auth-slice";
import { createPortfolioDataSlice } from "./portfolio-data-slice";
import { createGamificationSlice } from "./gamification-slice";
import { createUISlice } from "./ui-slice";
import { createTemplateSlice } from "./template-slice";
import { createMatchingSlice } from "./matching-slice";
import { createInitSlice } from "./init-slice";

export type {
  GameState,
  TemplateCustomization,
  PortfolioSectionCustomization,
  BosseurStreak,
  BackgroundTask,
} from "./types";
export { DEFAULT_TEMPLATE_CUSTOMIZATION } from "./types";

export const useGameStore = create<GameState>((set, get) => ({
  ...createAuthSlice(set, get),
  ...createPortfolioDataSlice(set, get),
  ...createGamificationSlice(set, get),
  ...createUISlice(set, get),
  ...createTemplateSlice(set, get),
  ...createMatchingSlice(set, get),
  ...createInitSlice(set, get),
}));
