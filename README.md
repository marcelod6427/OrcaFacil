# 🛠️ OrçaFácil: Gerador Inteligente de Orçamentos
*(Projeto Interno - Academia CRM)*

O **OrçaFácil** é uma plataforma SaaS projetada para automatizar a criação de propostas comerciais e orçamentos em PDF para profissionais autônomos (pedreiros, eletricistas, encanadores, pintores, etc.). Utilizando uma arquitetura orientada a eventos com n8n e Inteligência Artificial, o sistema transforma descrições em áudio ou texto em orçamentos estruturados e com identidade visual própria em segundos.

## ✨ Principais Funcionalidades

*   **Geração via Áudio ou Texto:** Captação de voz nativa direto no navegador ou entrada de texto livre, processados e convertidos em itens tabelados pela IA.
*   **Human-in-the-Loop:** Tela de revisão interativa onde o usuário aprova ou envia correções de valores e quantidades antes da geração do PDF final.
*   **White-Label (Personalização):** Configuração da identidade visual do PDF com upload de logotipo, seleção de cor primária e definição de regras comerciais/condições de pagamento.
*   **Gestão de Conta:** Autenticação completa via webhook (cadastro, login, recuperação de senha com código) e dashboard de histórico com visualizador de PDFs embutido.
*   **Sistema de Créditos:** Monetização integrada com controle de saldo de orçamentos (planos avulsos e anuais).

## 🏗️ Arquitetura e Stack Tecnológico

| Camada | Tecnologia | Função no Ecossistema |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS, JS Puro | Interface SPA fluida, responsiva (mobile-first) e ultraleve, construída sem frameworks adicionais. |
| **Orquestração** | n8n (Docker) | Motor central de backend. Recebe requisições REST/Webhooks do front-end e dita a lógica de negócios. |
| **Inteligência Artificial** | DeepSeek | Motor cognitivo. Interpreta as demandas brutas, calcula totais e devolve arrays JSON perfeitamente estruturados. |
| **Banco de Dados** | Supabase | Armazenamento de perfis, configurações White-Label, saldos de usuários e links base64 dos documentos. |
| **Mensageria** | Waha | Integração de ponta com o WhatsApp para recebimento e entrega automatizada de documentos. |

## 🚀 Infraestrutura e Deploy

O ambiente de produção foi desenhado para segurança e performance, hospedado em uma VPS dedicada:
*   **Proxy e Servidor Web:** OpenResty / iContainer gerenciando as rotas de domínio, atuando como proxy reverso seguro para a porta interna do n8n.
*   **Segurança e DNS:** Nuvem ativa da Cloudflare garantindo proteção contra DDoS, mascaramento de IP e tráfego forçado em HTTPS ponta a ponta.
*   **Firewall:** Proteção de portas nativa (UFW) bloqueando conexões externas não autorizadas aos containers Docker.

---
*Este repositório é privado e mantido pela equipe da **Academia CRM**.*
