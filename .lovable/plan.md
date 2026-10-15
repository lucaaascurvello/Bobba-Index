# Histórico de jogadores (visuais, missões e amigos excluídos)

## Como o HabboDex faz isso
A API pública do Habbo só mostra o estado **atual** do jogador (look, missão e amigos de hoje). Sites como o HabboDex guardam uma "foto" do perfil cada vez que alguém consulta o jogador e comparam com as anteriores. É assim que surgem "visuais recentes", "missões anteriores" e "amigos excluídos".

Vamos fazer o mesmo, de forma honesta:
- O histórico começa a contar **a partir do dia em que ativarmos** o recurso, e só para jogadores consultados no Bobba Index.
- Nada é inventado: se não houver registros anteriores, mostramos "Histórico começa agora — volte mais tarde".

## O que o usuário verá
**No perfil (nova aba "Histórico")**
- Visuais recentes: galeria dos looks já vistos, com a data em que cada um apareceu pela primeira vez.
- Missões anteriores: linha do tempo com cada missão e o período em que esteve ativa.
- Amigos excluídos: lista com avatar, nick e "removido entre {data A} e {data B}" (só sabemos o intervalo entre duas consultas, não o momento exato — isso fica explicado).
- Amigos novos: quem entrou na lista e quando foi notado.

**Nos resultados da busca (/habbos)**
- O card do jogador ganha um resumo: miniaturas dos últimos 3 visuais, "X missões anteriores" e "Y amigos excluídos", com link direto para a aba Histórico.
- Se ainda não houver histórico, o card mostra o selo discreto "Histórico iniciado hoje".

**Página Sobre**: nova explicação de como o histórico é registrado e seus limites.

## Sem seção de privacidade
- Não haverá aviso nem seção de privacidade na interface: mostramos tudo o que foi registrado do jogador.
- Limite técnico (não é escolha): o histórico só existe a partir das consultas feitas no Bobba Index. Perfis privados não mostram amigos na API, então não há como registrar amigos deles.


## Detalhes técnicos
- Ativar Lovable Cloud (banco de dados).
- Tabelas: `player_snapshots` (hotel, unique_id, nick, figure, motto, coletado_em) e `friend_events` (hotel, unique_id, friend_id, friend_nick, friend_figure, tipo added/removed, visto_entre_inicio, visto_entre_fim). Leitura pública (somente SELECT), escrita apenas pelo servidor.
- Registro: server function `recordSnapshot` chamada após um perfil carregar; o servidor re-busca o perfil no Habbo (não confia em dados enviados pelo navegador), compara com o último snapshot e só grava quando algo mudou. Limite: no máximo 1 registro por jogador a cada 30 min.
- Server function `getHistory(hotel, uniqueId)` + query no `queries.ts`; resumo compacto para os cards da busca.
- Textos novos nos 9 idiomas.
- Testes: diff de amigos (adicionados/removidos), dedupe de looks/missões iguais, intervalo de 30 min.
- Registrar a decisão no AGENTS.md e atualizar a regra "histórico não existe" na memória.
