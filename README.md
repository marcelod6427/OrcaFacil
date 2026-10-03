# OrçaFácil: Gerador Inteligente de Orçamentos

*(Projeto Interno - Academia CRM)*

O **OrçaFácil** é uma plataforma SaaS projetada para automatizar a criação de propostas comerciais e orçamentos em PDF para profissionais autônomos e prestadores de serviços (pedreiros, eletricistas, encanadores, pintores, etc.). Utilizando uma arquitetura moderna orientada a eventos com **n8n**, **Node.js** e **Inteligência Artificial**, o sistema transforma descrições enviadas por áudio ou texto via WhatsApp em orçamentos estruturados e com identidade visual própria em segundos.

## Principais Funcionalidades

* **Fluxo 100% via WhatsApp:** Captação de áudios (transcritos instantaneamente) e textos diretamente pelo WhatsApp do profissional. A IA extrai clientes, serviços, quantidades e valores de forma autônoma.
* **Human-in-the-Loop & Correção Natural:** O profissional recebe um rascunho em PDF e um menu interativo no WhatsApp. Ele pode aprovar ou pedir correções em linguagem natural (ex: *"Tira o desconto do Pix"* ou *"Muda a mão de obra para 800 reais"*).
* **White-Label e Layout Modular:** Configuração completa pelo painel web (logo, cor primária, segmento, regras de negócio). O PDF é gerado dinamicamente com blocos modulares que se adaptam aos meios de pagamento aceitos (Pix, Cartão, Dinheiro).
* **Segurança Avançada e LGPD:** Autenticação protegida por um proxy reverso em Node.js utilizando cookies **JWT HttpOnly**, verificação de cadastro em 2 etapas (código via WhatsApp), validação de senhas fortes e Rate Limiting.
* **Sistema de Créditos e Monetização:** Integração nativa com Mercado Pago para venda de pacotes de orçamentos (Planos Pro e Scale), com renovação automática de saldo via webhooks.
* **Notificações Inteligentes:** Sistema de tracking que alerta o profissional no WhatsApp assim que o cliente final abre o link do orçamento oficial (recurso exclusivo para planos superiores).

## Arquitetura e Stack Tecnológico

| Camada | Tecnologia | Função no Ecossistema |
| --- | --- | --- |
| **Frontend** | HTML5, CSS3, JS Vanilla | Interface SPA (Single Page Application) fluida, mobile-first e ultraleve, construída sem frameworks para máxima performance. |
| **Segurança (Proxy)** | Node.js (Express) | Middleware de segurança. Isola o n8n da internet pública, gerencia sessões com JWT em cookies HttpOnly e aplica Rate Limiting. |
| **Orquestração** | n8n | Motor central do backend. Gerencia os webhooks, integra todas as APIs e dita as regras de negócio e fluxos condicionais. |
| **Inteligência Artificial** | DeepSeek & Groq | Motores cognitivos. O **Groq (Whisper-large-v3)** transcreve áudios em tempo real. O **DeepSeek** interpreta as demandas, calcula totais e devolve o JSON final. |
| **Banco de Dados** | PostgreSQL | Armazenamento relacional de perfis, configurações White-Label, saldos, controle de sessões ativas e histórico de orçamentos. |
| **Mensageria & Docs** | WAHA & API2PDF | **WAHA** para integração de ponta a ponta com o WhatsApp. **API2PDF** (Chrome Engine) para renderização de HTML dinâmico em PDFs perfeitos. |

## Infraestrutura e Deploy

O ambiente de produção foi desenhado para escalabilidade, segurança e alta disponibilidade:

* **Docker & 1Panel:** Toda a stack (Node.js, n8n, Postgres, WAHA) é containerizada via Docker Compose e gerenciada visualmente através do 1Panel.
* **Isolamento de Portas:** O proxy Node.js atua como o único ponto de entrada para o Frontend, mascarando e protegendo os webhooks do n8n contra acessos não autorizados e injeções diretas.
* **Segurança Edge:** Nuvem ativa da Cloudflare garantindo proteção contra DDoS, proxy de DNS e tráfego forçado em HTTPS ponta a ponta.

---

*Este repositório é privado e as credenciais de ambiente (`.env`) são mantidas estritamente fora do controle de versão para fins de segurança.*
