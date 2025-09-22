// [file name]: tipos.ts
// ✅ NOVO ARQUIVO - Centraliza todas as interfaces

/**
 * Interface que representa um item individual dentro de um pedido
 * Contém informações básicas do produto selecionado
 */
export interface ItemPedido {
  nome: string;        // Nome do produto
  preco: number;       // Preço unitário do produto
  quantidade: number;  // Quantidade selecionada pelo cliente
}

/**
 * Interface que representa um pedido completo no sistema
 * Agrupa itens, informações de pagamento e dados do cliente
 */
export interface Pedido {
  id: number;           // Identificador único do pedido
  clienteId?: number;   // ID do cliente (opcional - pedidos podem ser sem cadastro)
  itens: ItemPedido[];  // Lista de produtos selecionados
  total: number;        // Valor total do pedido (já com descontos aplicados)
  pagamento: string;    // Forma de pagamento escolhida
  data: string;         // Data e hora do pedido (formato ISO string)
  desconto?: number;    // Valor do desconto aplicado (opcional)
}

/**
 * Interface que representa um cliente cadastrado no sistema
 * Armazena informações pessoais e de contato
 */
export interface Cliente {
  id: number;          // Identificador único do cliente
  nome: string;        // Nome completo
  idade: number;       // Idade do cliente
  telefone: string;    // Telefone para contato
  cpf: number;         // CPF (número único para identificação)
  email?: string;      // E-mail (campo opcional)
  endereco?: string;   // Endereço completo (campo opcional)
}

/**
 * Interface que representa um produto disponível para venda
 * Controla estoque, preço e disponibilidade
 */
export interface Produto {
  id: number;          // Identificador único do produto
  produto: string;     // Nome do produto
  tipo: string;        // Categoria/classificação do produto
  valor: number;       // Preço de venda
  quantidade: number;  // Quantidade disponível em estoque
  ativo: boolean;      // Status do produto (true = disponível, false = inativo)
}

/**
 * Interface que representa um cupom de desconto
 * Pode ser de valor fixo ou percentual
 */
export interface Cupom {
  id: number;                         // Identificador único do cupom
  codigo: string;                     // Código utilizado pelo cliente (ex: "DESC10")
  tipo: "percentual" | "valor";       // Tipo de desconto: percentual ou valor fixo
  desconto: number;                   // Valor do desconto (percentual ou valor)
  valido: boolean;                    // Status do cupom (true = válido, false = expirado/usado)
}
