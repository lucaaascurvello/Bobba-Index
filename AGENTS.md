<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Render the brand skull as unit SVG rectangles on a 9×9 grid with crispEdges and integer-multiple default dimensions; this preserves the supplied pixel geometry without bitmap scaling.
- All Habbo API calls live in `src/lib/habbo/api.ts` (pure fetch + normalization) and are exposed via server functions in `habbo.functions.ts`; UI consumes them only through `queries.ts` — keeps one timeout/error policy and lets the big gamedata file be parsed server-side.
- Server functions return `ApiResult` objects instead of throwing; `queries.ts` converts failures to `HabboError` so components can branch on `kind`.
- Hotels are configured in `src/lib/habbo/hotels.ts`; only enable a hotel after its endpoints are validated.
- Never render mock/demo player data; missing API fields map to null and show "indisponível".
- Device-only data (recent searches, favorites) lives in `src/lib/local-store.ts` via localStorage, read after hydration — no cloud backend needed for these. History of players is the only Cloud-backed data.
- Player history (looks, mottos, friend changes) is derived on read from `player_snapshots` rows written only by `recordSnapshotFn` (server re-fetches Habbo, max 1 write/30 min); logic lives in pure `src/lib/habbo/history.ts` so it stays testable.
