// [file name]: fazerPedidos.ts
// 🔧 ARQUIVO MODIFICADO - Vinculação de pedidos a clientes com console.clear()

// Importações necessárias
import promptSync from "prompt-sync";
import { loadData, saveData } from "./jsonDatabase";
import { listarCupons } from "./cadastro";
import { adicionarAoHistorico } from "./historicoService";
import { buscarClientePorId, listarClientes } from "./cadastro";
import { Pedido, ItemPedido } from "./tipos";
import { formatarMoeda } from "./utils";

// Configuração do prompt para entrada de dados do usuário
const prompt = promptSync();
// Arquivos de dados
const PEDIDOS_FILE = "pedidos.json";
const HISTORICO_FILE = "historico.json";

/**
 * Função principal para realizar um pedido completo
 * Inclui seleção de cliente, produtos, aplicação de cupons e processamento de pagamento
 */
export async function fazerPedido() {
  console.clear(); // Limpa o console para uma experiência mais limpa
  
  // Carrega os produtos disponíveis
  const produtos = loadData<any>("produtos.json");

  // Verifica se existem produtos cadastrados
  if (produtos.length === 0) {
    console.log("Nenhum produto cadastrado no sistema!");
    return; // Encerra a função se não houver produtos
  }

  // ===== SELEÇÃO DO CLIENTE =====
  console.log("======= SELECIONAR CLIENTE =======");
  const clientes = listarClientes();
  
  // Exibe lista de clientes se existirem
  if (clientes.length > 0) {
    console.table(clientes.map(c => ({ 
      id: c.id, 
      nome: c.nome, 
      telefone: c.telefone 
    })));
  }
  
  let clienteId: number | undefined;
  // Solicita ID do cliente (opcional)
  const opcaoCliente = prompt("Digite o ID do cliente (ou Enter para pedido sem cadastro): ");
  
  if (opcaoCliente) {
    clienteId = parseInt(opcaoCliente);
    const cliente = buscarClientePorId(clienteId);
    
    // Valida se o cliente existe
    if (!cliente) {
      console.log("Cliente não encontrado! Continuando com pedido sem cadastro.");
      clienteId = undefined;
    } else {
      console.clear();
      console.log(`Cliente: ${cliente.nome}`);
    }
  }

  // ===== SELEÇÃO DE PRODUTOS =====
  console.log("======= CARDÁPIO =======");
  // Exibe produtos disponíveis (ativos e com estoque)
  produtos.forEach((p, i) => {
    if (p.ativo && p.quantidade > 0) {
      console.log(`${i + 1}) ${p.produto} (${p.tipo}) - R$${p.valor} - Estoque: ${p.quantidade}`);
    }
  });

  // Solicita seleção de produtos
  const escolha = prompt("Escolha os itens separados por vírgula (ex: 1,3): ");
  const indices = escolha.split(",").map((n) => parseInt(n.trim()) - 1); // Converte para índices (0-based)

  let itens: ItemPedido[] = []; // Array para armazenar os itens do pedido
  let total = 0; // Valor total do pedido

  // Processa cada item selecionado
  indices.forEach((i) => {
    // Verifica se o índice é válido e o produto está disponível
    if (i >= 0 && i < produtos.length && produtos[i].ativo && produtos[i].quantidade > 0) {
      // Solicita quantidade desejada
      const quantidadeItem = Number(prompt(`Quantidade para ${produtos[i].produto}: `)) || 1;
      
      // Verifica se há estoque suficiente
      if (quantidadeItem <= produtos[i].quantidade) {
        // Adiciona item ao pedido
        itens.push({ 
          nome: produtos[i].produto, 
          preco: produtos[i].valor, 
          quantidade: quantidadeItem 
        });
        
        // Atualiza total e estoque
        total += produtos[i].valor * quantidadeItem;
        produtos[i].quantidade -= quantidadeItem; // Reduz estoque
        
      } else {
        console.log(`Estoque insuficiente para ${produtos[i].produto}. Disponível: ${produtos[i].quantidade}`);
      }
    }
  });

  // Verifica se pelo menos um item foi adicionado
  if (itens.length === 0) {
    console.log("Nenhum item válido selecionado!");
    return; // Encerra se nenhum item foi selecionado
  }

  // ===== FORMA DE PAGAMENTO =====
  console.log("======= PAGAMENTO =======");
  console.log("1) Dinheiro");
  console.log("2) Cartão de Crédito");
  console.log("3) Cartão de Débito");
  console.log("4) PIX");
  const opcaoPg = Number(prompt("Escolha a forma de pagamento: "));

  // ===== APLICAÇÃO DE CUPOM DE DESCONTO =====
  const codigoCupom = prompt("Digite o cupom de desconto (ou Enter para nenhum): ").toUpperCase();
  let descontoAplicado = 0; // Valor do desconto aplicado

  if (codigoCupom) {
    const cupons = listarCupons();
    const cupom = cupons.find(c => c.codigo === codigoCupom && c.valido); // Busca cupom válido

    if (cupom) {
      // Calcula desconto baseado no tipo do cupom
      if (cupom.tipo === "percentual") {
        descontoAplicado = (total * cupom.desconto) / 100; // Desconto percentual
      } else if (cupom.tipo === "valor") {
        descontoAplicado = cupom.desconto; // Desconto em valor fixo
      }
      
      console.log(`Cupom aplicado: ${codigoCupom} (-${formatarMoeda(descontoAplicado)})`);
      total -= descontoAplicado; // Aplica desconto ao total
      
      // Cupons de valor único são desativados após uso
      if (cupom.tipo === "valor") {
        // Esta função precisa ser implementada em cadastro.ts
        // desativarCupom(cupom.id);
      }
    } else {
      console.log("⚠️ Cupom inválido, nenhum desconto aplicado.");
    }
  }

  // Define forma de pagamento baseada na opção escolhida
  let pagamento = "Dinheiro";
  switch (opcaoPg) {
    case 1: pagamento = "Dinheiro"; break;
    case 2: pagamento = "Cartão de Crédito"; break;
    case 3: pagamento = "Cartão de Débito"; break;
    case 4: pagamento = "PIX"; break;
    default: pagamento = "Dinheiro"; break;
  }

  // ===== CRIAÇÃO DO PEDIDO =====
  const pedidos = loadData<Pedido>(PEDIDOS_FILE);
  
  // Cria novo pedido com ID sequencial
  const novoPedido: Pedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    clienteId, // Pode ser undefined para pedidos sem cliente
    itens,
    total,
    pagamento,
    desconto: descontoAplicado,
    data: new Date().toISOString() // Data/hora atual
  };

  // Salva pedido e atualiza estoque
  pedidos.push(novoPedido);
  saveData(PEDIDOS_FILE, pedidos);
  saveData("produtos.json", produtos); // Salva estoque atualizado

  // ===== CONFIRMAÇÃO DO PEDIDO =====
  console.log("Pedido registrado com sucesso!");
  console.table(novoPedido.itens); // Exibe itens em formato de tabela
  
  if (descontoAplicado > 0) {
    console.log(`Desconto aplicado: -${formatarMoeda(descontoAplicado)}`);
  }
  
  console.log(`TOTAL: ${formatarMoeda(novoPedido.total)}`);
  console.log(`Pagamento: ${novoPedido.pagamento}`);

  // ===== SIMULAÇÃO DE PREPARO =====
  console.log("Preparando pedido...");
  await new Promise((resolve) => setTimeout(resolve, 7000)); // Aguarda 7 segundos
  console.clear();
  console.log("Pedido pronto e entregue!");

  // ===== NOTA FISCAL =====
  console.log("\n======= NOTA FISCAL =======");
  console.log(`Pedido Nº: ${novoPedido.id}`);
  console.log(`Data: ${new Date(novoPedido.data).toLocaleString('pt-BR')}`); // Formata data brasileira
  
  if (clienteId) {
    const cliente = buscarClientePorId(clienteId);
    console.log(`Cliente: ${cliente?.nome}`);
  }
  
  // Tabela detalhada dos itens
  console.table(novoPedido.itens.map(item => ({
    Produto: item.nome,
    Quantidade: item.quantidade,
    'Preço Unit.': formatarMoeda(item.preco),
    Subtotal: formatarMoeda(item.preco * item.quantidade)
  })));
  
  if (descontoAplicado > 0) {
    console.log(`Desconto aplicado: -${formatarMoeda(descontoAplicado)}`);
  }
  
  console.log(`Total a pagar: ${formatarMoeda(novoPedido.total)}`);
  console.log(`Pagamento: ${novoPedido.pagamento}`);
  console.log("CNPJ: 12.345.678/0001-99");
  console.log("Endereço: Av. das Pizzas, 123 - Centro");
  console.log("OBRIGADO PELA PREFERÊNCIA!");
  console.log("=============================\n");

  // ===== LIMPEZA E ARMAZENAMENTO NO HISTÓRICO =====
  // Remove pedido da lista ativa (mantém apenas no histórico)
  const atualizados = loadData<Pedido>(PEDIDOS_FILE).filter((p) => p.id !== novoPedido.id);
  saveData(PEDIDOS_FILE, atualizados);
  console.log("Pedido removido do sistema.");

  // Salva no histórico permanente
  adicionarAoHistorico(novoPedido);
  console.log("Pedido salvo no histórico!");
}
