// Edge/WebView2 109 — Chromium 109, the last runtime that installs on Windows
// 7/8.1 — lacks the ES2023 Array copy methods and AbortSignal.any (Chrome
// 110/116). This app and its vendored diff-view dependency call both unguarded,
// and nothing transpiles built-ins, so they install here feature-detected.
// main.tsx imports this module before any other — keep it free of imports.

type Prototype = Record<string, unknown>;

function defineMissing(target: Prototype, key: string, value: unknown): void {
  if (key in target) return;
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
  });
}

const arrayProto = Array.prototype as unknown as Prototype;

defineMissing(
  arrayProto,
  "toSorted",
  function (this: unknown[], compareFn?: (a: unknown, b: unknown) => number) {
    return Array.from(this).sort(compareFn);
  },
);

defineMissing(arrayProto, "toReversed", function (this: unknown[]) {
  return Array.from(this).reverse();
});

defineMissing(
  arrayProto,
  "toSpliced",
  function (
    this: unknown[],
    ...args: [start?: number, deleteCount?: number, ...items: unknown[]]
  ) {
    const copy = Array.from(this);
    if (args.length === 0) return copy;
    // One argument deletes through the end; forwarding it as an explicit
    // `undefined` deleteCount would read as 0 and delete nothing instead.
    if (args.length === 1) copy.splice(args[0] as number);
    else copy.splice(args[0] as number, args[1] ?? 0, ...args.slice(2));
    return copy;
  },
);

defineMissing(
  AbortSignal as unknown as Prototype,
  "any",
  (signals: AbortSignal[]) => {
    const controller = new AbortController();
    const abort = (signal: AbortSignal) => {
      if (!controller.signal.aborted) controller.abort(signal.reason);
    };
    for (const signal of signals) {
      if (signal.aborted) {
        abort(signal);
        break;
      }
      signal.addEventListener("abort", () => abort(signal), { once: true });
    }
    return controller.signal;
  },
);
