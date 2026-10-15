# Fazer a busca funcionar em todos os hotéis Habbo

## O que descobrimos
- Hoje toda consulta ao Habbo sai do nosso servidor. A mensagem "Consulta recusada" aparece quando o Habbo responde 403/463 — é a proteção dele recusando pedidos vindos de servidores de nuvem, não um problema de um país específico. Por isso afetou o Brasil também.
- Teste feito agora: os hotéis Brasil, .com e Espanha respondem 200 e **autorizam explicitamente** consultas feitas direto do navegador de qualquer site (cabeçalho de permissão presente). Ou seja, o próprio Habbo libera esse caminho — não é contornar proteção.
- Diagnóstico ainda não confirmado na versão publicada; o primeiro passo valida isso.

## Estratégia
Consultar o Habbo a partir do navegador do visitante (cada pessoa usa sua própria conexão, como no site oficial), mantendo o servidor como plano B.

```text
Navegador -> Habbo (país escolhido)   [principal]
     \-> se falhar por rede/permissão -> nosso servidor -> Habbo   [reserva]
```

## Passos
1. Validar: testar busca, perfil, fotos e donos de emblema nos 9 hotéis com chamadas pequenas, confirmando a permissão do navegador em cada um.
2. Camada de consulta com dois caminhos: tentar direto do navegador; se falhar, usar o servidor. Mesmas regras de hoje (tempo limite 9s, mensagens de erro, nada inventado).
3. Catálogo de emblemas (arquivo grande, ~12 mil nomes) continua pelo servidor, com cache por hotel; se o servidor for recusado, mostrar aviso só nessa página.
4. Reativar os 8 hotéis no seletor apenas os que passarem no passo 1.
5. Indicador discreto por hotel: se um hotel falhar repetidamente, exibir "Hotel instável no momento" em vez de erro genérico.
6. Atualizar a página Sobre (remover aviso de "só Brasil") e testes.
7. Publicar e verificar na versão publicada: busca em Brasil, .com e Espanha.

## Detalhes técnicos
- `src/lib/habbo/api.ts`: extrair `fetch` para um transporte injetável; funções de mapeamento ficam iguais (usadas por cliente e servidor).
- Novo `src/lib/habbo/client-api.ts` + `queries.ts`: queryFn tenta fetch do navegador, fallback para server function em erro `network`/`blocked`.
- `hotels.ts`: `enabled: true` para hotéis validados; `hotel-context` inalterado.
- Testes: fallback acionado em `blocked`, não acionado em `not_found`; hotéis habilitados.
