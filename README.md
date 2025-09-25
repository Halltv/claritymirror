# ERP Financeiro com IA - ClarityMirror

Este é um projeto Next.js de um sistema de ERP financeiro construído no Firebase Studio, utilizando componentes da ShadCN, Genkit para funcionalidades de IA e Firebase para backend.

## Visão Geral da Arquitetura

O projeto é construído com uma stack moderna para aplicações web, priorizando performance, escalabilidade e uma ótima experiência de desenvolvimento.

-   **Frontend**: [Next.js](https://nextjs.org/) com [React](https://react.dev/) e o App Router. A interface é reativa, performática e renderizada tanto no servidor quanto no cliente.
-   **UI (Interface do Usuário)**: [ShadCN/UI](https://ui.shadcn.com/) e [Tailwind CSS](https://tailwindcss.com/). Utilizamos uma biblioteca de componentes pré-construídos, customizáveis e acessíveis para agilizar o desenvolvimento da UI.
-   **Backend e Banco de Dados**: [Firebase](https://firebase.google.com/). Usamos o Firestore como nosso banco de dados NoSQL em tempo real para armazenar todos os dados da aplicação (clientes, pedidos, orçamentos, etc.) e o Firebase Authentication para gerenciamento de usuários.
-   **Funcionalidades de IA**: [Genkit](https.firebase.google.com/docs/genkit). Uma framework open-source do Firebase para construir fluxos de IA robustos e seguros, que se integram com modelos como o Gemini.

## Primeiros Passos

Para rodar este projeto localmente na sua máquina, siga os passos abaixo.

### Pré-requisitos

1.  **Node.js:** Certifique-se de ter a versão LTS (Long-Term Support) do Node.js instalada. Você pode baixá-la em [nodejs.org](https://nodejs.org/).
2.  **Dependências Globais:** Instale as ferramentas `tsx` e `genkit-cli` globalmente para rodar as ferramentas de IA.
    ```bash
    npm install -g tsx genkit-cli
    ```
3.  **Chave da API do Google Gemini:** As funcionalidades de inteligência artificial deste projeto são alimentadas pelo Gemini.
    -   Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Crie uma nova chave de API (API Key).
    -   Copie a chave.

### Configuração Local

1.  **Instalar Dependências do Projeto:**
    Navegue até o diretório raiz do seu projeto e execute o seguinte comando para instalar todos os pacotes necessários listados no `package.json`:
    ```bash
    npm install
    ```

2.  **Configurar Variáveis de Ambiente:**
    -   Crie um arquivo chamado `.env` na raiz do seu projeto.
    -   Dentro deste arquivo, adicione a chave de API que você copiou do Google AI Studio. Substitua `SUA_CHAVE_API_AQUI` pela sua chave real.
        ```env
        GEMINI_API_KEY=SUA_CHAVE_API_AQUI
        ```
    -   **Importante**: Se você estiver usando o Firebase, certifique-se de que seu arquivo `src/lib/firebase.ts` contém a configuração correta do seu projeto Firebase.

### Rodando os Servidores de Desenvolvimento

Este projeto requer dois servidores rodando simultaneamente: um para a aplicação Next.js (a interface) e outro para o Genkit (a IA).

1.  **Inicie o Servidor Genkit (IA):**
    Abra um terminal e execute o comando abaixo. Ele irá observar as alterações nos arquivos de IA e reiniciar automaticamente.
    ```bash
    npm run genkit:watch
    ```

2.  **Inicie o Servidor Next.js (Interface):**
    Abra um **segundo terminal** (mantenha o primeiro rodando) e execute o comando:
    ```bash
    npm run dev
    ```

Agora, seu aplicativo deve estar rodando em [http://localhost:9002](http://localhost:9002).

## Estrutura do Projeto

A organização dos arquivos segue as convenções do Next.js e foi pensada para manter o código organizado e escalável.

-   `src/app`: O coração da aplicação Next.js, usando o App Router.
    -   `src/app/(app)`: Um grupo de rotas que compartilha o mesmo layout principal da aplicação (com menu lateral, cabeçalho, etc.).
        -   `dashboard/`, `clientes/`, `orcamentos/`, etc.: Cada pasta corresponde a uma página/rota da aplicação.
        -   `layout.tsx`: O layout principal compartilhado por todas as páginas dentro do grupo `(app)`.
    -   `layout.tsx`: O layout raiz da aplicação.
    -   `page.tsx`: A página de entrada principal (que atualmente redireciona para `/dashboard`).
-   `src/ai`: Contém todos os fluxos de IA criados com Genkit.
    -   `flows/`: Cada arquivo aqui define um fluxo específico, como `cash-flow-suggestions.ts`, que pode ser chamado a partir da aplicação.
    -   `genkit.ts`: Arquivo de configuração e inicialização do Genkit.
-   `src/components`: Contém todos os componentes React reutilizáveis.
    -   `ui/`: Componentes base da biblioteca ShadCN (Button, Card, Input, etc.). Não devem ser modificados diretamente.
    -   Outros arquivos (`main-nav.tsx`, `page-header.tsx`, etc.): Componentes customizados e específicos da nossa aplicação.
-   `src/hooks`: Hooks React customizados, como `use-toast.ts` para exibir notificações.
-   `src/lib`: Funções utilitárias, configurações e dados.
    -   `firebase.ts`: Configuração e inicialização do SDK do Firebase.
    -   `utils.ts`: Funções utilitárias (ex: `cn` para mesclar classes do Tailwind).
    -   `data.ts`: Contém dados estáticos (mock data) usados para desenvolvimento e demonstração.
-   `src/types`: Definições de tipos TypeScript para o projeto, garantindo a consistência dos dados em toda a aplicação.
-   `public/`: Arquivos estáticos acessíveis publicamente.
-   `tailwind.config.ts`: Arquivo de configuração do Tailwind CSS.
-   `next.config.ts`: Arquivo de configuração do Next.js.
