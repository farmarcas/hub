# Quickstart: Excluir solução

## Prerequisites
- Environment up: `docker compose up -d --build --wait`, with all three services `healthy`.
- Migration applied automatically when the API starts.
- Sample data: `docker compose exec api npm run db:seed`.

## Automated tests
- `docker compose exec api npm test`
- `docker compose exec api npm run test:integration`

## Manual scenarios
Use a test solution so the sample data stays intact.

| # | Scenario | Expected |
|---|---|---|
| 1 | As Marina, create "Teste exclusão" (theme Operação, related to Sonar, access "Toda a empresa", Publicada) | It shows up in the list and in the globe |
| 2 | Soluções: each row | Shows Editar, Arquivar and Excluir |
| 3 | Excluir on "Teste exclusão" → Cancelar (or Esc) | Nothing changes |
| 4 | Excluir on "Teste exclusão" | The confirmation lists "Sonar" and says it **stays in the Hub**, only losing the link |
| 5 | Confirm | Only "Teste exclusão" disappears from the list; counts go back to what they were before step 1 |
| 6 | Globe: search "teste"; open Sonar | Nothing found for "teste"; **Sonar is still there**, unchanged, without the deleted one among its related |
| 7 | Open the deleted solution's edit URL | "Solução não encontrada" |
