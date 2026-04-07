import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./index";

const mockStorage: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    },
  },
  writable: true,
});

describe("Matching Slice", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    useGameStore.setState({
      user: null,
      matchingOffers: [],
      searchQuery: "",
      contractTypeFilter: "",
      locationFilter: "",
      hasSearched: false,
      coverLetterOfferUrl: null,
      prepareFoxOffer: null,
    });
  });

  it("setSearchQuery met a jour la requete de recherche", () => {
    useGameStore.getState().setSearchQuery("Developpeur React");
    expect(useGameStore.getState().searchQuery).toBe("Developpeur React");
  });

  it("setContractTypeFilter et setLocationFilter mettent a jour les filtres", () => {
    useGameStore.getState().setContractTypeFilter("CDI");
    useGameStore.getState().setLocationFilter("Paris");

    expect(useGameStore.getState().contractTypeFilter).toBe("CDI");
    expect(useGameStore.getState().locationFilter).toBe("Paris");
  });

  it("setMatchingOffers persiste dans localStorage", () => {
    const offers = [
      { id: "1", title: "Dev React" },
      { id: "2", title: "Dev Node" },
    ];
    useGameStore.getState().setMatchingOffers(offers);

    expect(useGameStore.getState().matchingOffers).toEqual(offers);

    const stored = localStorage.getItem("matching_results_guest");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.matchingOffers).toEqual(offers);
  });

  it("loadPersistedMatchingResults restaure depuis localStorage", () => {
    const payload = {
      matchingOffers: [{ id: "1" }],
      searchQuery: "React",
      contractTypeFilter: "CDI",
      locationFilter: "Lyon",
      hasSearched: true,
    };
    localStorage.setItem("matching_results_guest", JSON.stringify(payload));

    useGameStore.getState().loadPersistedMatchingResults();

    const state = useGameStore.getState();
    expect(state.matchingOffers).toEqual([{ id: "1" }]);
    expect(state.searchQuery).toBe("React");
    expect(state.contractTypeFilter).toBe("CDI");
    expect(state.locationFilter).toBe("Lyon");
    expect(state.hasSearched).toBe(true);
  });

  it("setCoverLetterOfferUrl stocke l'URL", () => {
    useGameStore.getState().setCoverLetterOfferUrl("https://example.com/offre");
    expect(useGameStore.getState().coverLetterOfferUrl).toBe(
      "https://example.com/offre",
    );
  });

  it("setPrepareFoxOffer stocke et efface l'offre", () => {
    const offer = { offerUrl: "https://example.com", offerTitle: "Dev Senior" };
    useGameStore.getState().setPrepareFoxOffer(offer);
    expect(useGameStore.getState().prepareFoxOffer).toEqual(offer);

    useGameStore.getState().setPrepareFoxOffer(null);
    expect(useGameStore.getState().prepareFoxOffer).toBeNull();
  });
});
