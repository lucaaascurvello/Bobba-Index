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
- All Habbo API calls live in `src/lib/habbo/api.ts` (pure fetch + normalization) and are exposed via server functions in `habbo.functions.ts`; UI consumes them only through `queries.ts` — keeps one timeout/error policy and lets the big gamedata file be parsed server-side.
- Server functions return `ApiResult` objects instead of throwing; `queries.ts` converts failures to `HabboError` so components can branch on `kind`.
- Hotels are configured in `src/lib/habbo/hotels.ts`; only enable a hotel after its endpoints are validated.
- Never render mock/demo player data; missing API fields map to null and show "indisponível".
