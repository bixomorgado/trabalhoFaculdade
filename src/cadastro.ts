// Importa funções para carregar e salvar dados de/para arquivos JSON
import { loadData, saveData } from "./jsonDatabase";
// Importa os tipos de dados utilizados no sistema
import { Cliente, Produto, Cupom } from "./tipos";

// Constantes com os nomes dos arquivos de dados
const CUPONS_FILE = "cupons.json";
const CLIENTES_FILE = "clientes.json";
const PRODUTOS_FILE = "produtos.json";


// ==============================================
// CLIENTES - CRUD COMPLETO (Create, Read, Update, Delete)
// ==============================================

/**
 * Insere um novo cliente no sistema
 * @param nome - Nome completo do cliente
 * @param idade - Idade do cliente
 * @param telefone - Telefone para contato
 * @param cpf - CPF (número único)
 * @param email - Email (opcional)
 * @param endereco - Endereço (opcional)
 * @returns ID do cliente cadastrado
 * @throws Error se o CPF já estiver cadastrado
 */
export function inserirCliente(nome: string, idade: number, telefone: string, cpf: number, email?: string, endereco?: string): number {
  // Carrega a lista atual de clientes do arquivo
  const clientes = loadData<Cliente>(CLIENTES_FILE);
  
  // Verificar se CPF já existe para evitar duplicatas
  const cpfExistente = clientes.find(c => c.cpf === cpf);
  if (cpfExistente) {
    throw new Error("CPF já cadastrado no sistema");
  }
  
  // Cria novo cliente com ID sequencial automático
  const novoCliente: Cliente = {
    id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1, // Gera novo ID
    nome,
    idade,
    telefone,
    cpf,
    email,
    endereco
  };
  
  // Adiciona o novo cliente à lista e salva no arquivo
  clientes.push(novoCliente);
  saveData(CLIENTES_FILE, clientes);
  return novoCliente.id;
}

/**
 * Retorna a lista completa de clientes cadastrados
 * @returns Array com todos os clientes
 */
export function listarClientes(): Cliente[] {
  return loadData<Cliente>(CLIENTES_FILE);
}

/**
 * Atualiza os dados de um cliente existente
 * @param id - ID do cliente a ser atualizado
 * @param dados - Objeto parcial com os campos a serem atualizados
 * @returns true se o cliente foi encontrado e atualizado, false caso contrário
 */
export function atualizarCliente(id: number, dados: Partial<Cliente>): boolean {
  const clientes = loadData<Cliente>(CLIENTES_FILE);
  // Busca o índice do cliente pelo ID
  const index = clientes.findIndex(c => c.id === id);
  
  // Retorna false se o cliente não for encontrado
  if (index === -1) return false;
  
  // Atualiza apenas os campos fornecidos (merge dos dados)
  clientes[index] = { ...clientes[index], ...dados };
  saveData(CLIENTES_FILE, clientes);
  return true;
}

/**
 * Remove um cliente do sistema
 * @param id - ID do cliente a ser excluído
 * @returns true se o cliente foi encontrado e excluído, false caso contrário
 */
export function excluirCliente(id: number): boolean {
  const clientes = loadData<Cliente>(CLIENTES_FILE);
  const index = clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  // Remove o cliente do array e salva as alterações
  clientes.splice(index, 1);
  saveData(CLIENTES_FILE, clientes);
  return true;
}

/**
 * Busca um cliente específico pelo ID
 * @param id - ID do cliente a ser buscado
 * @returns O cliente encontrado ou undefined se não existir
 */
export function buscarClientePorId(id: number): Cliente | undefined {
  const clientes = loadData<Cliente>(CLIENTES_FILE);
  return clientes.find(c => c.id === id);
}

// ==============================================
// PRODUTOS - CRUD COMPLETO
// ==============================================

/**
 * Insere um novo produto no sistema
 * @param produto - Nome do produto
 * @param tipo - Categoria/tipo do produto
 * @param valor - Preço do produto
 * @param quantidade - Quantidade em estoque
 * @returns ID do produto cadastrado
 */
export function inserirProduto(produto: string, tipo: string, valor: number, quantidade: number): number {
  const produtos = loadData<Produto>(PRODUTOS_FILE);
  
  // Cria novo produto com ID sequencial e status ativo por padrão
  const novoProduto: Produto = {
    id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
    produto,
    tipo,
    valor,
    quantidade,
    ativo: true // Produto é criado como ativo
  };
  
  produtos.push(novoProduto);
  saveData(PRODUTOS_FILE, produtos);
  return novoProduto.id;
}

/**
 * Retorna a lista de produtos
 * @param apenasAtivos - Filtra apenas produtos ativos (padrão: true)
 * @returns Array de produtos (ativos ou todos)
 */
export function listarProdutos(apenasAtivos: boolean = true): Produto[] {
  const produtos = loadData<Produto>(PRODUTOS_FILE);
  return apenasAtivos ? produtos.filter(p => p.ativo) : produtos;
}

/**
 * Atualiza os dados de um produto existente
 * @param id - ID do produto a ser atualizado
 * @param dados - Objeto parcial com os campos a serem atualizados
 * @returns true se o produto foi encontrado e atualizado, false caso contrário
 */
export function atualizarProduto(id: number, dados: Partial<Produto>): boolean {
  const produtos = loadData<Produto>(PRODUTOS_FILE);
  const index = produtos.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  produtos[index] = { ...produtos[index], ...dados };
  saveData(PRODUTOS_FILE, produtos);
  return true;
}

/**
 * Realiza exclusão lógica do produto (marca como inativo)
 * @param id - ID do produto a ser "excluído"
 * @returns true se o produto foi encontrado e desativado, false caso contrário
 */
export function excluirProduto(id: number): boolean {
  // Exclusão lógica (apenas marca como inativo) para manter histórico
  return atualizarProduto(id, { ativo: false });
}

/**
 * Busca um produto específico pelo ID
 * @param id - ID do produto a ser buscado
 * @returns O produto encontrado ou undefined se não existir
 */
export function buscarProdutoPorId(id: number): Produto | undefined {
  const produtos = loadData<Produto>(PRODUTOS_FILE);
  return produtos.find(p => p.id === id);
}

// ==============================================
// CUPONS - CRUD COMPLETO
// ==============================================

/**
 * Insere um novo cupom de desconto
 * @param codigo - Código do cupom (será convertido para maiúsculas)
 * @param tipo - Tipo de desconto: "percentual" ou "valor"
 * @param desconto - Valor do desconto (percentual ou valor fixo)
 * @returns ID do cupom cadastrado
 */
export function inserirCupom(codigo: string, tipo: "percentual" | "valor", desconto: number): number {
  const cupons = loadData<Cupom>(CUPONS_FILE);
  
  const novoCupom: Cupom = {
    id: cupons.length > 0 ? Math.max(...cupons.map(c => c.id)) + 1 : 1,
    codigo: codigo.toUpperCase(), // Padroniza o código em maiúsculas
    tipo,
    desconto,
    valido: true // Cupom é criado como válido
  };
  
  cupons.push(novoCupom);
  saveData(CUPONS_FILE, cupons);
  return novoCupom.id;
}

/**
 * Retorna a lista de cupons
 * @param apenasValidos - Filtra apenas cupons válidos (padrão: true)
 * @returns Array de cupons (válidos ou todos)
 */
export function listarCupons(apenasValidos: boolean = true): Cupom[] {
  const cupons = loadData<Cupom>(CUPONS_FILE);
  return apenasValidos ? cupons.filter(c => c.valido) : cupons;
}

/**
 * Desativa um cupom (torna inválido)
 * @param id - ID do cupom a ser desativado
 * @returns true se o cupom foi encontrado e desativado, false caso contrário
 */
export function desativarCupom(id: number): boolean {
  const cupons = loadData<Cupom>(CUPONS_FILE);
  const index = cupons.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  // Marca o cupom como inválido (exclusão lógica)
  cupons[index].valido = false;
  saveData(CUPONS_FILE, cupons);
  return true;
}
