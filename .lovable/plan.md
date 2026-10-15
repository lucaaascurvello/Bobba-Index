# Corrigir "Catálogo indisponível (463)" na página Emblemas

## O que descobri
- O catálogo vem de um arquivo grande do Habbo (~3,9 MB, ~12.800 emblemas).
- O código 463 é a proteção do Habbo recusando o pedido. Testei aqui:
  - Pedido simples, sem identificação de navegador: **funciona (200)**.
  - Pedido com identificação de navegador ("Mozilla/5.0"): **recusado (463)**.
  - Pedido vindo de um site (com "Origin"): **recusado (403)** — por isso o navegador do visitante não pode baixar esse arquivo direto, ao contrário da busca de jogadores.
- O endereço `/1` redireciona para um arquivo com código de versão; o redirecionamento também passa pela proteção.

## O que vou fazer
1. Fazer o servidor pedir o catálogo de forma "limpa": identificação própria e simples ("BobbaIndex/1.0"), sem cabeçalhos de navegador, aceitando texto, e seguindo o redirecionamento manualmente.
2. Tentar duas vezes com pequena espera se vier 463/403, antes de desistir.
3. Guardar a última cópia boa do catálogo por hotel no backend (Lovable Cloud) e usá-la quando o Habbo recusar — assim a página continua funcionando, com um aviso discreto "catálogo de DD/MM, atualização temporariamente recusada pelo Habbo".
4. Manter o cache em memória de 6h para não pedir o arquivo toda hora.
5. Testes: cabeçalhos enviados não contêm identificação de navegador; recusa 463 usa a cópia guardada; sem cópia, mostra o erro como hoje.
6. Verificar abrindo /badges e buscando "natal" no Brasil e na Espanha.

## Detalhes técnicos
- `src/lib/habbo/api.ts` `loadCatalog`: `fetch(url, { redirect: "manual", headers: { "User-Agent": "BobbaIndex/1.0", Accept: "text/plain" } })`, resolver `Location`, retry 1x em 403/463.
- Nova tabela `badge_catalog_snapshots (hotel text pk, items jsonb, fetched_at timestamptz)`, RLS ligada, sem acesso público; leitura/escrita só no servidor via cliente admin dentro do handler.
- `BadgeCatalogPage` ganha `snapshotAt: string | null`; texto do aviso nos 9 idiomas.
- Ressalva: se a proteção do Habbo bloquear o servidor publicado por endereço de rede (não por cabeçalho), o item 3 garante a página com a última cópia; a primeira cópia precisa ser obtida uma vez com sucesso.
