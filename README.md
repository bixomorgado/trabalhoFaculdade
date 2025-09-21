# 🍕 Sistema de Pizzaria

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/node-%3E%3D14-green)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D4-blue)
![Downloads](https://img.shields.io/npm/dt/pizzaria-system)
![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)

Sistema completo de gerenciamento para pizzarias, desenvolvido em **TypeScript**. Permite cadastro de clientes, produtos, pedidos, cupons, relatórios e histórico de vendas.

---

## 🎬 Demonstração

![Demo](https://i.postimg.cc/MpJDC3Qd/Captura-de-tela-2025-09-20-163616.png)

*Imagem ilustrativa mostrando fluxo de pedidos e cadastro de clientes.*

---

## 🚀 Funcionalidades

* ✅ Cadastro completo de clientes (CRUD)
* ✅ Cadastro completo de produtos (CRUD)
* ✅ Sistema de pedidos com múltiplas formas de pagamento (Dinheiro, Cartão, PIX)
* ✅ Cupons de desconto (percentual e valor fixo)
* ✅ Relatórios de vendas (diário, mensal, por cliente, personalizado)
* ✅ Histórico de compras por cliente
* ✅ Controle de estoque automático
* ✅ Emissão de nota fiscal

---

## 📂 Estrutura do Projeto

```
pizzaria-system/
├── src/
│   ├── main.ts
│   ├── cadastro.ts
│   ├── relatorio.ts
│   ├── fazerPedidos.ts
│   ├── historicoService.ts
│   ├── tipos.ts
│   ├── utils.ts
│   └── jsonDatabase.ts
├── data/
│   ├── clientes.json
│   ├── produtos.json
│   ├── pedidos.json
│   ├── historico.json
│   └── cupons.json
└──
```

---

## ⚙️ Pré-requisitos

* Node.js ≥ 14
* npm ou yarn

---

## 💻 Instalação Rápida

```bash
# Clonar repositório
git clone https://github.com/Bakeend/trabalhoFaculdade.git

# Instalar dependências
npm install
```

### Execução com npx

```bash
# Executar aplicação rapidamente
npx ts-node src/main.ts
```

---

## 📦 Dependências

* `prompt-sync` → Entrada de dados no terminal
* `@types/node` → Tipos TypeScript para Node.js (dev)
* `typescript` e `ts-node` → Compilar e executar TypeScript

Instalação:

```bash
npm install prompt-sync
npm install -D @types/node typescript ts-node
```

---

## 🛠 Scripts

* `npm start` → Executa a aplicação
* `npm run build` → Compila TypeScript para JavaScript
* `npm run dev` → Executa em modo de desenvolvimento


---
