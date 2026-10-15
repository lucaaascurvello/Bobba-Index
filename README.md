# Habbo Explorer Hub

# BOBBA INDEX — Plataforma de exploração do universo Habbo

Crie uma aplicação web completa chamada **Bobba Index**, uma plataforma independente para pesquisar, explorar e consultar informações públicas de jogadores do Habbo Hotel.

Referências de projeto:
- Referência funcional: https://habbodex.com/habbos
- Referência de qualidade visual e acabamento: https://coruja-insights.lovable.app/

Use essas referências para entender o tipo de experiência desejada, sem copiar código-fonte, logotipos, textos exclusivos ou elementos proprietários. Desenvolva uma identidade própria para o Bobba Index.

O objetivo não é entregar somente um layout estático. Quero uma aplicação funcional, com arquitetura organizada, integração real com fontes de dados públicas do Habbo e tratamento adequado de erros.

---

## 1. Conceito e posicionamento

O Bobba Index é um explorador da comunidade Habbo.

A plataforma permite que usuários pesquisem jogadores, consultem perfis públicos, visualizem avatares, explorem emblemas e descubram outras informações disponíveis publicamente.

Posicionamento:
- Nome: Bobba Index
- Slogan: O universo Habbo, indexado.
- Idioma inicial: português brasileiro.
- Hotel inicial: Habbo Brasil.
- Público: jogadores antigos, colecionadores de emblemas, fãs do Habbo e curiosos.
- Estilo: tecnologia, nostalgia e exploração de dados.

O projeto deve parecer uma ferramenta de tecnologia bem construída, e não um fã-site genérico.

Não apresente o Bobba Index como produto oficial, afiliado ou patrocinado pela Sulake ou pelo Habbo Hotel.

## 2. Identidade visual

Crie um design system próprio, inspirado no acabamento de dashboards e ferramentas modernas como o Coruja Insights.

Paleta:
- Fundo principal: #101014
- Superfícies secundárias: #19191F
- Cards: #1E1E26
- Roxo elétrico: #8B5CF6
- Roxo claro: #A78BFA
- Texto principal: #F5F5F7
- Texto secundário: #A1A1AA
- Bordas: #30303A
- Verde para estados positivos, usado com moderação.

Direção estética:
- Dark mode como padrão.
- Tipografia moderna e altamente legível.
- Hierarquia visual consistente.
- Cards com bordas discretas e cantos moderadamente arredondados.
- Espaçamento generoso.
- Ícones Lucide.
- Transições suaves e microinterações discretas.
- Efeitos de brilho muito sutis, sem exageros.
- Elementos pixel art somente onde fizerem sentido: avatares, emblemas e detalhes do universo Habbo.
- Evitar aparência infantil, excesso de cores, gradientes espalhafatosos ou elementos decorativos sem função.

A interface precisa ter acabamento de produto SaaS premium.

Priorize desktop, mantendo responsividade completa em dispositivos móveis.

## 3. Arquitetura e tecnologias

Utilize:
- React.
- TypeScript.
- Componentes reutilizáveis.
- Tailwind CSS e a biblioteca de componentes já existente no projeto, se aplicável.
- React Router ou solução equivalente para rotas.
- TanStack Query ou mecanismo equivalente para gerenciamento de requisições e cache, caso faça sentido na arquitetura existente.

Separe claramente:
- Páginas.
- Componentes visuais.
- Tipos TypeScript.
- Serviços de API.
- Hooks de consulta.
- Utilitários.
- Estados de carregamento, erro e ausência de dados.

Não concentre toda a lógica no componente principal.

Não reescreva ou remova funcionalidades existentes sem necessidade. Antes de modificar um projeto já iniciado, inspecione sua estrutura atual.

## 4. Integração real com o Habbo

Antes de construir os recursos de pesquisa, investigue e valide os endpoints públicos disponíveis.

Utilize como ponto de partida a documentação técnica comunitária do Habbo SDK:
https://github.com/michyaraque/habbo-sdk

Priorize a API pública oficial do Habbo para consultar jogadores. Utilize serviços comunitários adicionais somente quando forem necessários e apropriados.

Não presuma que os endpoints de uma biblioteca estejam atualizados. Verifique as URLs, os formatos de resposta, os hotéis suportados e as limitações atuais.

Implemente uma camada de serviços independente da interface.

A camada deve:
1. Receber o hotel e o nick pesquisado.
2. Normalizar e validar a entrada.
3. Realizar a consulta ao endpoint correto.
4. Interpretar a resposta real.
5. Converter os dados para tipos internos consistentes.
6. Tratar respostas vazias, erros HTTP, timeout e falhas de rede.
7. Retornar informações que os componentes possam exibir.

Comece pelo hotel brasileiro, utilizando o identificador e os endpoints confirmados pela documentação.

Prepare a arquitetura para permitir outros hotéis posteriormente.

### Regras obrigatórias da integração

- Não invente endpoints.
- Não invente respostas da API.
- Não apresente jogadores fictícios como reais.
- Não use dados de demonstração misturados com resultados reais.
- Não suponha que a API permita pesquisar todos os jogadores por uma consulta global.
- Não faça varredura massiva de nomes ou IDs.
- Não tente contornar CORS, autenticação, rate limits ou outros mecanismos de proteção.
- Não peça a senha ou credenciais do usuário no Habbo.
- Se for necessária uma função de backend, implemente-a apenas quando a plataforma e a fonte de dados exigirem isso.
- Nunca exponha segredos no frontend.
- Se um endpoint não funcionar, documente a limitação e não o substitua silenciosamente por dados inventados.

Se a API pública não permitir busca por correspondência parcial ou listagem geral, implemente busca por nick exato como primeira funcionalidade e informe essa limitação na interface ou documentação.

Se a consulta direta do navegador for bloqueada por CORS, avalie uma função de backend ou proxy autorizado, respeitando os termos aplicáveis. Não considere que CORS pode ser resolvido apenas alterando o código do frontend.

## 5. Página principal — /habbos

Essa é a principal página do projeto.

### Cabeçalho

Crie um cabeçalho minimalista com:
- Símbolo original do Bobba Index.
- Nome Bobba Index.
- Navegação para Habbos, Emblemas e Sobre.
- Seletor do hotel.
- Indicador visual do tema escuro.
- Layout responsivo com menu mobile.

Não utilize o logotipo oficial do Habbo como se fosse a marca do projeto.

### Hero

Título:
“Explore o universo Habbo.”

Subtítulo:
“Jogadores, emblemas e histórias em um só lugar.”

Elemento central:
- Campo de pesquisa de jogadores.
- Placeholder: “Digite o nick de um jogador...”
- Botão de pesquisa com ícone.
- Atalho para pesquisar com Enter.
- Feedback de pesquisa em andamento.

O campo de busca deve ser o elemento visual principal da página.

### Funcionamento da pesquisa

Ao pesquisar um nick:
1. Validar o campo.
2. Impedir buscas vazias.
3. Exibir um estado de carregamento.
4. Consultar a API real.
5. Exibir os resultados retornados.
6. Permitir abrir um perfil.
7. Mostrar uma mensagem clara quando não houver resultados.
8. Permitir tentar novamente em caso de falha.

Se o endpoint oferecer apenas busca exata, não simule busca parcial.

Implemente debounce somente quando existir uma estratégia de pesquisa que realmente se beneficie dele.

### Resultados

Exiba resultados em cards com:
- Avatar oficial do jogador, quando disponível.
- Nick.
- Missão pública, quando disponível.
- Data de criação, quando fornecida.
- Indicador de informações indisponíveis, quando necessário.
- Ação para abrir o perfil.

Não exiba informações como status online, número de amigos ou quantidade de quartos se elas não forem retornadas por uma fonte confiável.

Cada card deve ter:
- Hover discreto.
- Área clicável clara.
- Imagem com fallback.
- Layout consistente.
- Boa legibilidade.

Se a API retornar um único jogador, apresente um resultado único com a mesma qualidade visual dos cards.

Se houver suporte confirmado a resultados múltiplos, implemente paginação ou carregamento progressivo.

Não crie uma lista inicial de jogadores fictícios para preencher espaço.

### Estado inicial

Antes de pesquisar, a página deve continuar visualmente interessante sem inventar dados.

Utilize:
- Uma composição visual original.
- Explicação breve sobre o funcionamento da pesquisa.
- Atalhos para explorar outras áreas reais do projeto.
- Ilustrações decorativas próprias ou elementos visuais inspirados em pixel art.

Não exiba contadores fictícios de jogadores, emblemas ou visitas.

## 6. Perfil do jogador

Crie uma rota dinâmica:

/habbo/:hotel/:username

A rota deve carregar os dados do jogador pela API, utilizando o hotel e o identificador adequado.

O nick pode conter caracteres especiais ou diferenças entre maiúsculas e minúsculas. Faça o tratamento correto para URLs, codificação e resolução do perfil.

### Cabeçalho do perfil

Exiba:
- Avatar em destaque.
- Nick.
- Missão pública.
- Hotel de origem.
- Data de registro, se disponível.
- Ação para copiar o link do perfil.
- Botão para voltar aos resultados.

### Abas

Implemente as seguintes abas:

1. Visão geral.
2. Emblemas.
3. Grupos.
4. Quartos.

Cada aba deve apresentar dados reais quando disponíveis.

Se determinado endpoint não existir ou os dados estiverem indisponíveis, mostre uma mensagem contextual. Não invente conteúdo.

### Visão geral

Organize os dados em cards compactos e bem hierarquizados.

Inclua somente os campos retornados pela API ou por uma fonte pública validada.

### Emblemas

Se a API disponibilizar os emblemas do jogador:
- Exiba a imagem do emblema.
- Nome ou descrição, quando disponíveis.
- Código ou identificador, quando disponível.
- Tooltip com informações complementares.
- Layout em grade responsiva.

Não confunda emblemas equipados com a coleção completa do jogador. Identifique corretamente cada conjunto de dados.

### Grupos

Exiba os grupos públicos fornecidos pela fonte de dados.

Inclua nome, imagem e outras informações somente quando estiverem disponíveis.

### Quartos

Exiba os quartos públicos que puderem ser consultados.

Inclua nome, imagem, descrição e demais metadados apenas se a fonte retornar esses dados.

## 7. Explorador de emblemas — /badges

Crie uma página dedicada à exploração de emblemas.

Primeiro, verifique se existe uma fonte de dados acessível e apropriada para esse catálogo.

Quando houver dados reais:
- Exibir emblemas em uma grade.
- Pesquisar por nome ou código.
- Permitir filtrar por categorias que existam na fonte.
- Abrir detalhes do emblema.
- Exibir imagem, código, descrição e outras informações disponíveis.

Não invente categorias ou informações de raridade.

Se a fonte permitir apenas consultar emblemas individuais, não apresente isso como um catálogo completo.

A página deve mostrar claramente quando o catálogo estiver indisponível ou incompleto.

## 8. Navegação e rotas

Implemente:
- /habbos — busca e exploração de jogadores.
- /habbo/:hotel/:username — perfil do jogador.
- /badges — explorador de emblemas.
- /about — sobre o projeto.

Crie uma página 404 com a identidade visual do Bobba Index.

Todas as rotas precisam funcionar ao atualizar diretamente o navegador, dentro das limitações de hospedagem.

## 9. Experiência do usuário

Implemente estados completos para:
- Carregamento.
- Resultado encontrado.
- Nenhum resultado.
- Falha de conexão.
- Limite de requisições atingido.
- Perfil inexistente.
- Perfil privado ou parcialmente indisponível.
- Dados incompletos.
- Recurso não suportado pelo hotel selecionado.

Não use alertas nativos do navegador como principal forma de feedback.

Utilize skeletons, mensagens contextuais, botões para tentar novamente e notificações discretas.

Evite consultas duplicadas. Configure cache e invalidação de forma apropriada.

Não armazene informações pessoais desnecessárias. Armazene apenas o que for necessário para a experiência e respeite as condições da fonte de dados.

## 10. Desempenho e acessibilidade

- Utilize carregamento progressivo quando necessário.
- Otimize imagens e dimensões dos avatares.
- Implemente lazy loading em imagens fora da área inicial.
- Utilize alt text adequado.
- Garanta navegação por teclado.
- Mantenha contraste suficiente.
- Adicione labels aos campos.
- Evite requisições excessivas.
- Trate timeout e cancelamento de consultas quando apropriado.
- Evite layout shift durante carregamentos.
- Garanta uma experiência funcional em telas pequenas.

## 11. Segurança e transparência

- Não exponha chaves privadas no código cliente.
- Não solicite credenciais do Habbo.
- Não contorne proteções técnicas.
- Não colete dados privados.
- Não apresente informações indisponíveis como se fossem reais.
- Não copie a marca, o logotipo ou os ativos proprietários de sites de referência.
- Inclua uma página Sobre com a descrição do projeto como ferramenta independente, sem afiliação oficial ao Habbo Hotel.
- Respeite os termos de uso das fontes consultadas.

## 12. Critérios de conclusão

Antes de considerar o projeto pronto, valide:

1. A busca consulta uma fonte real.
2. A busca trata corretamente resultados vazios.
3. Um perfil válido abre pela rota dinâmica.
4. A página trata corretamente erros de API.
5. Os dados reais não são misturados com demonstrações.
6. As abas refletem a disponibilidade real de cada endpoint.
7. O layout funciona em desktop e mobile.
8. As rotas podem ser abertas diretamente.
9. O console não apresenta erros críticos.
10. Os componentes não quebram quando um campo é nulo ou ausente.

Ao final, apresente um resumo técnico contendo:
- Endpoints efetivamente testados.
- Dados que podem ser consultados.
- Funcionalidades implementadas.
- Limitações encontradas.
- Recursos que ainda dependem de outra fonte de dados.

**Prioridade máxima:** entregar primeiro uma página de busca de jogadores visualmente excelente e funcional com dados reais. Depois, ampliar para emblemas, grupos e quartos. Não simule sucesso em integrações que não foram testadas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e66854b4-ebb6-4bc9-aa51-bea7f4722e16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
