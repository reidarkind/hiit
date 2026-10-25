import { describe, expect, it, vi } from "vitest";
import { applyAppUpdate, checkForAppUpdate, type UpdateBridge } from "./updates";

function bridge(opts: {
  online: boolean;
  waiting?: boolean;
  update?: () => Promise<void>;
}): UpdateBridge & { worker: { postMessage: ReturnType<typeof vi.fn> } | null } {
  const worker = opts.waiting ? { postMessage: vi.fn() } : null;
  return {
    worker,
    isOnline: () => opts.online,
    getRegistration: async () => ({
      waiting: worker,
      update: opts.update ?? (async () => {}),
    }),
  };
}

describe("oppdatering", () => {
  it("lar være å spørre nettverket når telefonen er offline", async () => {
    const update = vi.fn(async () => {});
    const result = await checkForAppUpdate(bridge({ online: false, update }));
    expect(result).toBe("offline");
    expect(update).not.toHaveBeenCalled();
  });

  it("sier fra når det ikke ligger en ny versjon og venter", async () => {
    expect(await checkForAppUpdate(bridge({ online: true }))).toBe("current");
  });

  it("sier fra når en ny versjon venter", async () => {
    expect(await checkForAppUpdate(bridge({ online: true, waiting: true }))).toBe("available");
  });

  it("behandler en feilet sjekk som manglende nett", async () => {
    const result = await checkForAppUpdate(bridge({
      online: true,
      update: async () => {
        throw new Error("failed");
      },
    }));
    expect(result).toBe("offline");
  });

  it("venter til den nye versjonen har tatt over før siden lastes på nytt", async () => {
    const reload = vi.fn();
    const env = bridge({ online: true, waiting: true });
    let release = () => {};
    const controlled = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pending = applyAppUpdate(env, { reload, whenControlled: () => controlled });
    await vi.waitFor(() => expect(env.worker?.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" }));
    expect(reload).not.toHaveBeenCalled();
    release();
    await pending;
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
