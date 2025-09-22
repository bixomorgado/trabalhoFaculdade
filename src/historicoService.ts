// ==============================================
// SISTEMA COMPLETO DE GESTÃO - CLIENTES, PRODUTOS, PEDIDOS E HISTÓRICO
// ==============================================

// TIPOS DE DADOS
interface Cliente {
    id: number;
    nome: string;
    idade: number;
    telefone: string;
    cpf: number;
    email?: string;
    endereco?: string;
}

interface Produto {
    id: number;
    produto: string;
    tipo: string;
    valor: number;
    quantidade: number;
    ativo: boolean;
}

interface Cupom {
    id: number;
    codigo: string;
    tipo: "percentual" | "valor";
    desconto: number;
    valido: boolean;
}

interface ItemPedido {
    nome: string;
    preco: number;
    quantidade: number;
}

interface Pedido {
    id: number;
    clienteId?: number;
    itens: ItemPedido[];
    total: number;
    pagamento: string;
    desconto: number;
    data: string;
}

// ==============================================
// FUNÇÕES DE BANCO DE DADOS (SIMULAÇÃO)
// ==============================================

function loadData<T>(filename: string): T[] {
    try {
        // Simulação - na implementação real, lería do arquivo JSON
        return [];
    } catch (error) {
        return [];
    }
}

function saveData<T>(filename: string, data: T[]): void {
    // Simulação - na implementação real, salvaría no arquivo JSON
    console.log(`Dados salvos em ${filename}: ${data.length} registros`);
}

function formatarMoeda(valor: number): string {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// ==============================================
// CADASTRO - CLIENTES, PRODUTOS E CUPONS
// ==============================================

const CUPONS_FILE = "cupons.json";
const CLIENTES_FILE = "clientes.json";
const PRODUTOS_FILE = "produtos.json";

// CLIENTES - CRUD COMPLETO
export function inserirCliente(nome: string, idade: number, telefone: string, cpf: number, email?: string, endereco?: string): number {
    const clientes = loadData<Cliente>(CLIENTES_FILE);
    
    // Verificar se CPF já existe
    const cpfExistente = clientes.find(c => c.cpf === cpf);
    if (cpfExistente) {
        throw new Error("CPF já cadastrado no sistema");
    }
    
    const novoCliente: Cliente = {
        id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
        nome,
        idade,
        telefone,
        cpf,
        email,
        endereco
    };
    
    clientes.push(novoCliente);
    saveData(CLIENTES_FILE, clientes);
    return novoCliente.id;
}

export function listarClientes(): Cliente[] {
    return loadData<Cliente>(CLIENTES_FILE);
}

export function atualizarCliente(id: number, dados: Partial<Cliente>): boolean {
    const clientes = loadData<Cliente>(CLIENTES_FILE);
    const index = clientes.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    // Atualiza apenas os campos fornecidos
    clientes[index] = { ...clientes[index], ...dados };
    saveData(CLIENTES_FILE, clientes);
    return true;
}

export function excluirCliente(id: number): boolean {
    const clientes = loadData<Cliente>(CLIENTES_FILE);
    const index = clientes.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    clientes.splice(index, 1);
    saveData(CLIENTES_FILE, clientes);
    return true;
}

export function buscarClientePorId(id: number): Cliente | undefined {
    const clientes = loadData<Cliente>(CLIENTES_FILE);
    return clientes.find(c => c.id === id);
}

// PRODUTOS - CRUD COMPLETO
export function inserirProduto(produto: string, tipo: string, valor: number, quantidade: number): number {
    const produtos = loadData<Produto>(PRODUTOS_FILE);
    
    const novoProduto: Produto = {
        id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
        produto,
        tipo,
        valor,
        quantidade,
        ativo: true
    };
    
    produtos.push(novoProduto);
    saveData(PRODUTOS_FILE, produtos);
    return novoProduto.id;
}

export function listarProdutos(apenasAtivos: boolean = true): Produto[] {
    const produtos = loadData<Produto>(PRODUTOS_FILE);
    return apenasAtivos ? produtos.filter(p => p.ativo) : produtos;
}

export function atualizarProduto(id: number, dados: Partial<Produto>): boolean {
    const produtos = loadData<Produto>(PRODUTOS_FILE);
    const index = produtos.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    produtos[index] = { ...produtos[index], ...dados };
    saveData(PRODUTOS_FILE, produtos);
    return true;
}

export function excluirProduto(id: number): boolean {
    // Exclusão lógica (apenas marca como inativo)
    return atualizarProduto(id, { ativo: false });
}

export function buscarProdutoPorId(id: number): Produto | undefined {
    const produtos = loadData<Produto>(PRODUTOS_FILE);
    return produtos.find(p => p.id === id);
}

// CUPONS - CRUD COMPLETO
export function inserirCupom(codigo: string, tipo: "percentual" | "valor", desconto: number): number {
    const cupons = loadData<Cupom>(CUPONS_FILE);
    
    const novoCupom: Cupom = {
        id: cupons.length > 0 ? Math.max(...cupons.map(c => c.id)) + 1 : 1,
        codigo: codigo.toUpperCase(),
        tipo,
        desconto,
        valido: true
    };
    
    cupons.push(novoCupom);
    saveData(CUPONS_FILE, cupons);
    return novoCupom.id;
}

export function listarCupons(apenasValidos: boolean = true): Cupom[] {
    const cupons = loadData<Cupom>(CUPONS_FILE);
    return apenasValidos ? cupons.filter(c => c.valido) : cupons;
}

export function desativarCupom(id: number): boolean {
    const cupons = loadData<Cupom>(CUPONS_FILE);
    const index = cupons.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    cupons[index].valido = false;
    saveData(CUPONS_FILE, cupons);
    return true;
}

// ==============================================
// SISTEMA DE PEDIDOS
// ==============================================

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
                desativarCupom(cupom.id);
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

// ==============================================
// SISTEMA DE HISTÓRICO
// ==============================================

/**
 * Obtém todo o histórico de pedidos do sistema
 * @returns Array com todos os pedidos já realizados
 */
export function obterHistoricoCompleto(): Pedido[] {
    return loadData<Pedido>(HISTORICO_FILE);
}

/**
 * Filtra o histórico de pedidos por um cliente específico
 * @param clienteId - ID do cliente para filtrar os pedidos
 * @returns Array de pedidos pertencentes ao cliente especificado
 */
export function obterHistoricoPorCliente(clienteId: number): Pedido[] {
    // Carrega todo o histórico
    const historico = loadData<Pedido>(HISTORICO_FILE);
    // Filtra apenas os pedidos do cliente especificado
    return historico.filter(pedido => pedido.clienteId === clienteId);
}

/**
 * Filtra o histórico de pedidos por um período de tempo
 * @param dataInicio - Data de início do período
 * @param dataFim - Data de fim do período
 * @returns Array de pedidos realizados dentro do período especificado
 */
export function obterHistoricoPorPeriodo(dataInicio: Date, dataFim: Date): Pedido[] {
    const historico = loadData<Pedido>(HISTORICO_FILE);
    
    return historico.filter(pedido => {
        // Converte a string de data do pedido para objeto Date
        const dataPedido = new Date(pedido.data);
        // Verifica se a data do pedido está dentro do intervalo especificado
        return dataPedido >= dataInicio && dataPedido <= dataFim;
    });
}

/**
 * Obtém estatísticas detalhadas de um cliente específico
 * @param clienteId - ID do cliente para análise
 * @returns Objeto com diversas estatísticas do cliente
 */
export function obterEstatisticasCliente(clienteId: number) {
    // Obtém todos os pedidos do cliente
    const historicoCliente = obterHistoricoPorCliente(clienteId);
    
    // Calcula o total gasto pelo cliente
    const totalGasto = historicoCliente.reduce((total, pedido) => total + pedido.total, 0);
    
    // Conta o número total de pedidos
    const totalPedidos = historicoCliente.length;
    
    // Extrai e agrupa todos os produtos comprados pelo cliente
    const produtosComprados = historicoCliente.flatMap(pedido => 
        pedido.itens.map(item => ({ 
            nome: item.nome, 
            quantidade: item.quantidade 
        }))
    );
    
    // Agrupar produtos por nome para obter totais de cada produto
    const produtosAgrupados: {[key: string]: number} = {};
    produtosComprados.forEach(produto => {
        // Soma as quantidades para cada produto
        produtosAgrupados[produto.nome] = (produtosAgrupados[produto.nome] || 0) + produto.quantidade;
    });
    
    // Retorna objeto com todas as estatísticas calculadas
    return {
        totalGasto,           // Valor total gasto pelo cliente
        totalPedidos,         // Número total de pedidos realizados
        produtosComprados: produtosAgrupados,  // Produtos e quantidades compradas
        ticketMedio: totalPedidos > 0 ? totalGasto / totalPedidos : 0  // Valor médio por pedido
    };
}

/**
 * Adiciona um novo pedido ao histórico permanente
 * @param pedido - Pedido concluído a ser armazenado no histórico
 */
export function adicionarAoHistorico(pedido: Pedido): void {
    // Carrega o histórico atual
    const historico = loadData<Pedido>(HISTORICO_FILE);
    // Adiciona o novo pedido ao array
    historico.push(pedido);
    // Salva o histórico atualizado no arquivo
    saveData(HISTORICO_FILE, historico);
}

// ==============================================
// FUNÇÃO AUXILIAR PARA PROMPT (SIMULAÇÃO)
// ==============================================

function prompt(mensagem: string): string {
    // Simulação - na implementação real, usaría prompt-sync
    console.log(mensagem);
    return "1"; // Valor simulado para testes
}

// ==============================================
// EXEMPLO DE USO DO SISTEMA
// ==============================================

// Exemplo de como usar as funções:
async function exemploUso() {
    // Cadastrar um cliente
    const clienteId = inserirCliente("João Silva", 30, "11999999999", 12345678900);
    
    // Cadastrar produtos
    const produto1Id = inserirProduto("Pizza Margherita", "Pizza", 45.90, 10);
    const produto2Id = inserirProduto("Coca-Cola", "Bebida", 8.50, 20);
    
    // Criar um cupom de desconto
    const cupomId = inserirCupom("DESCONTO10", "percentual", 10);
    
    // Fazer um pedido
    await fazerPedido();
    
    // Consultar histórico
    const historico = obterHistoricoCompleto();
    const estatisticas = obterEstatisticasCliente(clienteId);
    
    console.log("Estatísticas do cliente:", estatisticas);
}

// ==============================================
// RESUMO DAS FUNÇÕES DISPONÍVEIS
// ==============================================

/*
CLIENTES:
- inserirCliente()
- listarClientes() 
- atualizarCliente()
- excluirCliente()
- buscarClientePorId()

PRODUTOS:
- inserirProduto()
- listarProdutos()
- atualizarProduto() 
- excluirProduto()
- buscarProdutoPorId()

CUPONS:
- inserirCupom()
- listarCupons()
- desativarCupom()

PEDIDOS:
- fazerPedido()

HISTÓRICO:
- obterHistoricoCompleto()
- obterHistoricoPorCliente()
- obterHistoricoPorPeriodo() 
- obterEstatisticasCliente()
- adicionarAoHistorico()
*/

console.log("Sistema de gestão carregado com sucesso!");
