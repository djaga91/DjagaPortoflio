import { describe, it, expect, vi, beforeEach } from "vitest";
import { retryWithBackoff } from "./client";

describe("retryWithBackoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("retourne le resultat au premier essai si la fonction reussit", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    const promise = retryWithBackoff(fn);
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retente sur erreur 503 et finit par reussir", async () => {
    const error503 = { response: { status: 503 }, code: "ERR_BAD_RESPONSE" };
    const fn = vi
      .fn()
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce("recovered");

    const promise = retryWithBackoff(fn, 3, 100);

    // Premier appel echoue, attend 100ms
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("lance immediatement sur erreur non-503/non-network", async () => {
    const error400 = { response: { status: 400 }, code: "ERR_BAD_REQUEST" };
    const fn = vi.fn().mockRejectedValue(error400);

    await expect(retryWithBackoff(fn)).rejects.toEqual(error400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("lance apres avoir epuise tous les retries sur 503", async () => {
    vi.useRealTimers();
    const error503 = { response: { status: 503 }, code: "ERR_BAD_RESPONSE" };
    const fn = vi.fn().mockRejectedValue(error503);

    await expect(retryWithBackoff(fn, 2, 10)).rejects.toEqual(error503);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
