import type { GameState, SetState, GetState } from "./types";

const STORAGE_KEY_MATCHING_RESULTS = (userId: string) =>
  `matching_results_${userId || "guest"}`;

type MatchingSlice = Pick<
  GameState,
  | "matchingOffers"
  | "searchQuery"
  | "contractTypeFilter"
  | "locationFilter"
  | "hasSearched"
  | "coverLetterOfferUrl"
  | "prepareFoxOffer"
  | "setMatchingOffers"
  | "setSearchQuery"
  | "setContractTypeFilter"
  | "setLocationFilter"
  | "setHasSearched"
  | "persistMatchingResults"
  | "loadPersistedMatchingResults"
  | "setCoverLetterOfferUrl"
  | "setPrepareFoxOffer"
>;

export const createMatchingSlice = (
  set: SetState,
  get: GetState,
): MatchingSlice => ({
  matchingOffers: [],
  searchQuery: "",
  contractTypeFilter: "",
  locationFilter: "",
  hasSearched: false,
  coverLetterOfferUrl: null,
  prepareFoxOffer: null,

  setMatchingOffers: (offers) => {
    set({ matchingOffers: offers });
    get().persistMatchingResults();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setContractTypeFilter: (filter) => set({ contractTypeFilter: filter }),
  setLocationFilter: (filter) => set({ locationFilter: filter }),
  setHasSearched: (searched) => set({ hasSearched: searched }),
  setCoverLetterOfferUrl: (url) => set({ coverLetterOfferUrl: url }),
  setPrepareFoxOffer: (offer) => set({ prepareFoxOffer: offer }),

  persistMatchingResults: () => {
    const state = get();
    const userId = state.user?.id ?? "guest";
    try {
      const payload = {
        matchingOffers: state.matchingOffers,
        searchQuery: state.searchQuery,
        contractTypeFilter: state.contractTypeFilter,
        locationFilter: state.locationFilter,
        hasSearched: state.hasSearched,
      };
      localStorage.setItem(
        STORAGE_KEY_MATCHING_RESULTS(userId),
        JSON.stringify(payload),
      );
    } catch (e) {
      console.warn("persistMatchingResults failed", e);
    }
  },

  loadPersistedMatchingResults: () => {
    const state = get();
    const userId = state.user?.id ?? "guest";
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MATCHING_RESULTS(userId));
      if (!raw) return;
      const data = JSON.parse(raw) as {
        matchingOffers?: any[];
        searchQuery?: string;
        contractTypeFilter?: string;
        locationFilter?: string;
        hasSearched?: boolean;
      };
      set({
        matchingOffers: data.matchingOffers ?? [],
        searchQuery: data.searchQuery ?? "",
        contractTypeFilter: data.contractTypeFilter ?? "",
        locationFilter: data.locationFilter ?? "",
        hasSearched: data.hasSearched ?? false,
      });
    } catch (e) {
      console.warn("loadPersistedMatchingResults failed", e);
    }
  },
});
