# Resin Route

**Resin Route** é um planejador semanal interativo para **Genshin Impact**, criado para organizar o uso de **Resina Original** e outras atividades recorrentes do jogo de forma visual, rápida e prática.

O projeto combina uma agenda semanal com uma biblioteca dinâmica de personagens, armas, artefatos, domínios e chefes semanais. Em vez de funcionar como uma simples lista de tarefas, o Resin Route relaciona informações do próprio jogo — como materiais necessários, domínios correspondentes e dias disponíveis — para ajudar o jogador a decidir **o que farmar e quando farmar**.

> **Projeto independente feito por fã.**
> Genshin Impact, seus personagens, nomes, imagens e demais recursos pertencem à HoYoverse.

---

## ✨ Principais recursos

### 📅 Planejamento semanal de Resina

* Planejamento separado por **segunda a domingo**.
* Controle de Resina planejada por dia.
* Limite diário configurável.
* Marcação individual de atividades concluídas.
* Resumo semanal com:

  * tarefas planejadas;
  * tarefas concluídas;
  * consumo de Resina.
* Notas opcionais em cada atividade.
* Persistência automática do planejamento no navegador.

---

## 🎮 Biblioteca de dados do Genshin Impact

A biblioteca permite navegar e pesquisar conteúdo do jogo sem precisar cadastrar tudo manualmente.

Atualmente inclui:

* 👤 **Personagens**
* ⚔️ **Armas**
* 🏺 **Artefatos**
* 📖 **Domínios de Talento e Arma**
* 👹 **Chefes Semanais**
* 🧭 **Miscelânea**

Os cards utilizam ícones e retratos do jogo sempre que disponíveis, com fallbacks visuais para evitar elementos vazios caso algum asset externo não possa ser carregado.

---

## 👤 Planejamento por personagem

Ao selecionar um personagem, o Resin Route oferece opções específicas de farm:

* **Chefe de ascensão**
* **Materiais para upar**
* **Talentos**
* **Chefe semanal**

O modal também apresenta uma prévia visual dos materiais relacionados ao personagem.

---

## 🔗 Relação entre personagens, armas e domínios

O aplicativo cruza os materiais utilizados por personagens e armas com as recompensas dos domínios.

Isso permite:

* pesquisar um personagem dentro da área de **Domínios** e encontrar seu domínio de Talento;
* pesquisar uma arma e encontrar seu domínio de materiais de ascensão;
* visualizar os dias da semana em que o material está disponível;
* exibir diretamente o ícone do livro de Talento ou material de Arma correspondente ao domínio;
* mostrar nas próprias armas o domínio relacionado e seus dias de farm.

A relação funciona aproximadamente assim:

```text
Personagem
    ↓
Material de Talento
    ↓
Domínio correspondente
    ↓
Dias disponíveis
```

Para armas:

```text
Arma
    ↓
Material de Ascensão
    ↓
Domínio correspondente
    ↓
Dias disponíveis
```

---

## 📆 Validação dos dias de farm

O Resin Route impede que materiais restritos por calendário sejam adicionados em dias incorretos.

Por exemplo:

> Se um livro de Talento estiver disponível apenas em **segunda, quinta e domingo**, o aplicativo avisa caso o jogador tente adicioná-lo à **quarta-feira** e informa quais são os dias válidos.

Isso ajuda a evitar planejamentos impossíveis dentro do calendário do jogo.

---

## 🏺 Artefatos e Strongbox

A seção de artefatos possui:

* biblioteca visual de conjuntos de artefatos;
* possibilidade de adicionar um conjunto ao plano para farm em domínio;
* integração com **Strongbox / Oferenda Mística**;
* seleção visual do conjunto desejado utilizando a mesma biblioteca de artefatos.

Atividades de Strongbox não consomem Resina no planejamento.

---

## 🧭 Miscelânea

Atividades que não dependem diretamente de Resina ficam organizadas em uma seção própria.

Atualmente estão disponíveis:

* 🏺 **Rota de Artefatos**
* 🪙 **Rota de Mora**
* 💎 **Rota de Minério**
* 📦 **Strongbox de Artefatos**
* ➕ **Tarefa personalizada**

---

## 💾 Backup do planejamento

O planejamento é salvo automaticamente através de `localStorage`, mas também pode ser exportado para backup.

O menu **Backup** permite:

* baixar o planejamento em `.json`;
* restaurar um backup salvo anteriormente;
* copiar o conteúdo do backup para a área de transferência.

O backup preserva:

* tarefas;
* progresso;
* notas;
* tentativas;
* limite diário de Resina.

---

## 🌐 Português e inglês

A interface possui suporte a:

* 🇧🇷 **Português do Brasil (PT-BR)**
* 🇺🇸 **English (EN)**

A escolha de idioma também é persistida no navegador.

---

## 🛠️ Tecnologias utilizadas

O Resin Route foi desenvolvido como uma **aplicação web estática** e não depende de framework ou backend.

| Tecnologia                            | Uso                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| **HTML5**                             | Estrutura e componentes da interface                                                   |
| **CSS3**                              | Layout responsivo, tema inspirado em Genshin e animações                               |
| **JavaScript (Vanilla)**              | Estado da aplicação, filtros, modais, calendário, relações entre dados e interações    |
| **localStorage**                      | Persistência local do planejamento e preferências                                      |
| **genshin-db / genshin-db-dist**      | Base de dados de personagens, armas, materiais, domínios, artefatos e outros conteúdos |
| **jsDelivr CDN**                      | Carregamento dos bundles atualizados do banco de dados e assets externos               |
| **File System Access API / Blob API** | Exportação do backup quando suportada pelo navegador                                   |
| **Clipboard API**                     | Cópia alternativa do backup                                                            |

### Sem build step

O projeto não exige:

* React;
* Vue;
* Node.js;
* banco de dados próprio;
* processo de build obrigatório.

Isso mantém o aplicativo:

* leve;
* fácil de hospedar;
* simples de estudar e modificar;
* utilizável em praticamente qualquer serviço de hospedagem de sites estáticos.

---

## 📚 Fonte dos dados

Os dados atuais do jogo são carregados a partir do projeto comunitário **genshin-db / genshin-db-dist**.

A aplicação utiliza esses dados para construir dinamicamente relações como:

```text
Personagem → Material de Talento → Domínio → Dias disponíveis
```

```text
Arma → Material de Ascensão → Domínio → Dias disponíveis
```

As relações são feitas principalmente através dos identificadores dos materiais, evitando manter manualmente uma lista para cada personagem e arma.

Quando possível, essa abordagem permite que novos conteúdos sejam reconhecidos automaticamente conforme a base de dados externa é atualizada.

> Uma conexão com a internet é necessária para obter a biblioteca completa e atualizada.
> O planejamento salvo localmente continua independente desses dados externos.

---

## 🚀 Como executar

### Opção 1 — Servidor local com Python

Na pasta do projeto, execute:

```bash
python -m http.server 8080
```

Depois abra no navegador:

```text
http://localhost:8080
```

### Opção 2 — Outro servidor estático

Também é possível utilizar ferramentas como:

* **Live Server** no Visual Studio Code;
* qualquer servidor HTTP local;
* serviços de hospedagem de sites estáticos.

> Abrir `index.html` diretamente pode funcionar, mas alguns navegadores aplicam restrições adicionais a páginas executadas através de `file://`. Por isso, um servidor local é recomendado.

---

## 📁 Estrutura do projeto

```text
genshin-resin-planner/
├── index.html      # Página principal / versão autocontida para preview
├── styles.css      # Estilos da aplicação
├── app.js          # Lógica e interações
└── README.md       # Documentação do projeto
```

O `index.html` distribuído atualmente também contém os recursos necessários para facilitar previews em ambientes que não carregam corretamente arquivos irmãos.

---

## 💽 Persistência de dados

O Resin Route foi projetado para funcionar **sem contas de usuário ou servidor próprio**.

O estado principal é armazenado no navegador através de `localStorage`, incluindo:

* planejamento semanal;
* tarefas concluídas;
* limite diário de Resina;
* notas e tentativas;
* idioma selecionado.

### ⚠️ Importante

Dados salvos no `localStorage` pertencem ao navegador e ao domínio em que o site está sendo executado.

Isso significa que:

* limpar os dados do navegador pode apagar o planejamento;
* trocar de navegador não transfere os dados automaticamente;
* utilizar outro dispositivo não sincroniza o planejamento.

Para esses casos, utilize o recurso de **Backup**.

---

## ☁️ Hospedagem

Como o projeto é totalmente estático, pode ser publicado gratuitamente em serviços como:

* **GitHub Pages**
* **Cloudflare Pages**
* **Netlify**
* **Vercel**

Nenhum servidor de aplicação ou banco de dados próprio é necessário para a versão atual.

---

## 🎨 Design

A interface foi inspirada visualmente na identidade de **Genshin Impact**, utilizando:

* tons de azul, creme e dourado;
* painéis semelhantes a pergaminho;
* cards visuais para personagens e itens;
* pequenos elementos ornamentais;
* layout responsivo para desktop e telas menores.

O objetivo não é reproduzir a interface oficial, mas manter uma identidade visual familiar para jogadores do jogo enquanto prioriza **legibilidade, organização e rapidez de uso**.

---

## 🧠 Decisões de projeto

### Interface contextual

Os modais não apresentam todos os campos para todos os tipos de item.

Cada categoria mostra apenas as opções relevantes para aquela ação.

Por exemplo:

* personagens possuem um seletor de **“O que farmar”**;
* artefatos podem oferecer **Domínio** ou **Strongbox**;
* domínios utilizam informações relacionadas aos seus próprios materiais.

Isso reduz campos redundantes e mantém a interface mais simples.

### Dados relacionados em vez de listas manuais

Sempre que possível, personagens e armas são associados aos seus domínios através dos IDs reais dos materiais utilizados.

Isso:

* reduz manutenção manual;
* facilita acompanhar novos conteúdos;
* evita duplicar grandes listas dentro do código;
* permite aproveitar atualizações da base de dados externa.

### Funcionalidade sem conta

Todo o planejamento funciona localmente.

Isso elimina a necessidade de:

* autenticação;
* servidor próprio;
* banco de dados remoto;
* coleta desnecessária de informações do usuário.

---

## ⚠️ Limitações atuais

* A biblioteca completa depende de uma fonte de dados comunitária e de conexão com a internet.
* Alterações na estrutura externa do `genshin-db` podem exigir atualização da camada de integração.
* Alguns assets muito recentes podem demorar a aparecer nos CDNs utilizados.
* O planejamento não sincroniza automaticamente entre dispositivos.
* O aplicativo não acessa a conta do jogador.
* O aplicativo não lê dados diretamente da HoYoverse.

---

## 🗺️ Possíveis melhorias futuras

Algumas ideias que podem expandir o projeto:

* [ ] Cálculo de materiais baseado em nível atual e nível desejado.
* [ ] Cálculo automático de Talentos, Ascensão e Armas.
* [ ] Estimativa de quantos dias de Resina são necessários para um objetivo.
* [ ] Múltiplos perfis ou planejamentos.
* [ ] Sincronização opcional entre dispositivos.
* [ ] Filtros adicionais por região, elemento e raridade.
* [ ] Planejamento de personagens completos em uma única tela.
* [ ] PWA para instalação no desktop e celular.
* [ ] Melhorias de acessibilidade.
* [ ] Navegação completa por teclado.

---

## ❤️ Créditos e aviso legal

Este projeto utiliza dados do ecossistema comunitário **genshin-db**.

**Resin Route não possui afiliação oficial com HoYoverse.**

Genshin Impact, HoYoverse e todos os personagens, nomes, imagens, ícones e demais propriedades relacionadas pertencem aos seus respectivos detentores de direitos.

O projeto é uma ferramenta não oficial criada por fã para fins de planejamento.

---

## 📄 Licença

Antes de publicar ou distribuir o projeto como código aberto, escolha uma licença para o código criado para o Resin Route — por exemplo, **MIT** — de acordo com a forma como você deseja permitir reutilização e contribuições.

A eventual licença do código não concede direitos sobre assets, nomes ou propriedade intelectual de **Genshin Impact / HoYoverse**, nem sobre dados de terceiros utilizados pelo projeto.
