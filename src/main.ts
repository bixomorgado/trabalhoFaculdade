// [file name]: main.ts
// 🔧 ARQUIVO MODIFICADO - Menu completo com console.clear()

// Importações de módulos externos e internos
import promptSync from "prompt-sync";
// Importa todas as funções de cadastro necessárias
import { 
  inserirCliente, 
  inserirProduto, 
  listarClientes, 
  atualizarCliente,
  excluirCliente,
  buscarClientePorId,
  listarProdutos,
  atualizarProduto,
  excluirProduto,
  inserirCupom, 
  listarCupons, 
  desativarCupom 
} from "./cadastro";
// Importa função principal de pedidos
import { fazerPedido } from "./fazerPedidos";
// Importa função de relatórios
import { gerarRelatorio } from "./relatorio";
// Importa funções de histórico do cliente
import { obterHistoricoPorCliente, obterEstatisticasCliente } from "./historicoService";
// Importa funções de validação
import { validarCPF, validarEmail } from "./utils";

// Configura o prompt para entrada de dados do usuário
const prompt = promptSync();

/**
 * FUNÇÃO PRINCIPAL - Controla o fluxo principal da aplicação
 * Menu hierárquico com navegação completa do sistema PDV
 */
async function main() {
    console.clear(); // Limpa o console ao iniciar
    let loop = true; // Controla o loop principal
    
    // LOOP PRINCIPAL DO SISTEMA
    while (loop) {
        console.clear();
        // MENU PRINCIPAL
        console.log("======= PDV PIZZARIA ==========");
        console.log("1) Pedidos");
        console.log("2) Cadastros");
        console.log("3) Administração");
        console.log("4) Sair");
        let resposta = Number(prompt("Escolha: "));
        console.clear();
        
        // NAVEGAÇÃO DO MENU PRINCIPAL
        switch (resposta) {
            case 1: // MÓDULO DE PEDIDOS
                console.log("======= PEDIDOS ==========");
                await fazerPedido(); // Chama função assíncrona de pedidos
                break;

            case 2: // MÓDULO DE CADASTROS
                console.log("======= CADASTRO ==========");
                console.log("1) Gerenciar clientes");
                console.log("2) Gerenciar produtos");
                console.log("3) Voltar");
                resposta = Number(prompt("Escolha: "));
                console.clear();
                
                // SUBMENU DE CADASTROS
                switch (resposta) {
                    case 1:
                        gerenciarClientes(); // Gerencia clientes
                        break;

                    case 2:
                        gerenciarProdutos(); // Gerencia produtos
                        break;

                    case 3: // Voltar ao menu principal
                        break;

                    default:
                        console.log("Opção inválida");
                        break;
                }
                break;

            case 3: // MÓDULO DE ADMINISTRAÇÃO
                console.log("======= ADMINISTRAÇÃO ==========");
                console.log("1) Relatórios");
                console.log("2) Gerenciar cupons");
                console.log("3) Histórico de clientes");
                console.log("4) Voltar");
                resposta = Number(prompt("Escolha: "));

                // SUBMENU DE ADMINISTRAÇÃO
                switch (resposta) {
                    case 1: // RELATÓRIOS
                        console.clear();
                        console.log("1) Relatório por mês");
                        console.log("2) Relatório por dia");
                        console.log("3) Relatório por cliente");
                        console.log("4) Relatório personalizado");
                        const relatorioOpcao = Number(prompt("Escolha: "));
                        
                        // Tipos de relatórios disponíveis
                        if (relatorioOpcao === 1) {
                            gerarRelatorio("mes"); // Relatório mensal
                        } else if (relatorioOpcao === 2) {
                            gerarRelatorio("dia"); // Relatório diário
                        } else if (relatorioOpcao === 3) {
                            // Relatório específico por cliente
                            const clienteId = Number(prompt("ID do cliente: "));
                            gerarRelatorio("cliente", { clienteId });
                        } else if (relatorioOpcao === 4) {
                            // Relatório personalizado por período
                            const dataInicio = prompt("Data início (YYYY-MM-DD): ");
                            const dataFim = prompt("Data fim (YYYY-MM-DD): ");
                            gerarRelatorio("personalizado", { dataInicio, dataFim });
                        }
                        break;
                        
                    case 2: // GERENCIAR CUPONS
                        console.clear();
                        console.log("1) Adicionar cupom");
                        console.log("2) Listar cupons");
                        console.log("3) Desativar cupom");
                        const cupomOpcao = Number(prompt("Escolha: "));
                        
                        if (cupomOpcao === 1) {
                            // Cadastro de novo cupom
                            const codigo = prompt("Digite o código do cupom: ");
                            const tipo = prompt("Tipo (percentual/valor): ") as "percentual" | "valor";
                            const desconto = Number(prompt("Digite o valor do desconto: "));
                            const id = inserirCupom(codigo, tipo, desconto);
                            console.log(`Cupom criado! id: ${id}`);
                        } else if (cupomOpcao === 2) {
                            // Listagem de cupons
                            console.table(listarCupons());
                        } else if (cupomOpcao === 3) {
                            // Desativação de cupom
                            const id = Number(prompt("Digite o ID do cupom para desativar: "));
                            if (desativarCupom(id)) {
                                console.log("Cupom desativado com sucesso!");
                            } else {
                                console.log("Cupom não encontrado.");
                            }
                        }
                        break;
                        
                    case 3: // HISTÓRICO DE CLIENTES
                        console.clear();
                        const clienteId = Number(prompt("ID do cliente para consultar histórico: "));
                        // Obtém dados do histórico e estatísticas
                        const historico = obterHistoricoPorCliente(clienteId);
                        const estatisticas = obterEstatisticasCliente(clienteId);
                        
                        // Exibe relatório completo do cliente
                        console.log(`\n=== HISTÓRICO DO CLIENTE #${clienteId} ===`);
                        console.log(`Total de pedidos: ${estatisticas.totalPedidos}`);
                        console.log(`Total gasto: R$${estatisticas.totalGasto.toFixed(2)}`);
                        console.log(`Ticket médio: R$${estatisticas.ticketMedio.toFixed(2)}`);
                        
                        console.log("\nÚltimos pedidos:");
                        // Mostra os 5 últimos pedidos
                        historico.slice(-5).forEach(pedido => {
                            console.log(`\nPedido #${pedido.id} - ${new Date(pedido.data).toLocaleDateString('pt-BR')}`);
                            console.log(`Total: R$${pedido.total.toFixed(2)}`);
                            console.log(`Forma de pagamento: ${pedido.pagamento}`);
                        });
                        break;
                        
                    case 4: // Voltar
                        break;
                }
                break;

            case 4: // SAIR DO SISTEMA
                loop = false;
                console.log("======= PDV PIZZARIA ==========");
                console.log("Saindo.....");
                break;

            default: // OPÇÃO INVÁLIDA
                console.log("Opção inválida");
                break;
        }
        
        // PAUSA PARA LEITURA ANTES DE LIMPAR (exceto quando sair)
        if (loop) {
            prompt("Pressione Enter para continuar...");
            console.clear();
        }
    }
}

/**
 * FUNÇÃO DE GERENCIAMENTO DE CLIENTES
 * Submenu completo para operações CRUD de clientes
 */
function gerenciarClientes() {
    let loop = true;
    while (loop) {
        console.clear();
        console.log("======= GERENCIAR CLIENTES ==========");
        console.log("1) Novo cliente");
        console.log("2) Listar clientes");
        console.log("3) Atualizar cliente");
        console.log("4) Excluir cliente");
        console.log("5) Voltar");
        const resposta = Number(prompt("Escolha: "));
        
        switch (resposta) {
            case 1: // CADASTRAR NOVO CLIENTE
                console.clear();
                console.log("======= CADASTRO CLIENTE ==========");
                // Coleta dados do cliente
                const nome = prompt("Nome do cliente: ");
                const idade = Number(prompt("Idade do cliente: "));
                const telefone = prompt("Número de telefone: ");
                const cpf = Number(prompt("CPF (apenas números): "));
                const email = prompt("E-mail (opcional): ");
                const endereco = prompt("Endereço (opcional): ");
                
                // VALIDAÇÕES
                if (!validarCPF(cpf)) {
                    console.log("CPF inválido!");
                    break;
                }
                
                if (email && !validarEmail(email)) {
                    console.log("E-mail inválido!");
                    break;
                }
                
                // Tenta cadastrar o cliente
                try {
                    const id = inserirCliente(nome, idade, telefone, cpf, email, endereco);
                    console.log(`Cliente cadastrado com ID: ${id}`);
                } catch (error: any) {
                    console.error("Erro ao cadastrar cliente:", error.message);
                }
                break;
                
            case 2: // LISTAR CLIENTES
                try {
                    console.clear();
                    const clientes = listarClientes();
                    console.log("======= CLIENTES CADASTRADOS ==========");
                    console.table(clientes); // Exibe em formato de tabela
                } catch (error) {
                    console.error("Erro ao listar clientes:", error);
                }
                break;
                
            case 3: // ATUALIZAR CLIENTE
                console.clear();
                const idAtualizar = Number(prompt("ID do cliente para atualizar: "));
                const cliente = buscarClientePorId(idAtualizar);
                
                if (!cliente) {
                    console.log("Cliente não encontrado!");
                    break;
                }
                
                // Interface de atualização com valores atuais como padrão
                console.log("Deixe em branco para manter o valor atual");
                const novoNome = prompt(`Nome [${cliente.nome}]: `) || cliente.nome;
                const novaIdade = Number(prompt(`Idade [${cliente.idade}]: `) || cliente.idade);
                const novoTelefone = prompt(`Telefone [${cliente.telefone}]: `) || cliente.telefone;
                const novoEmail = prompt(`E-mail [${cliente.email || ""}]: `) || cliente.email;
                const novoEndereco = prompt(`Endereço [${cliente.endereco || ""}]: `) || cliente.endereco;
                
                // Executa a atualização
                if (atualizarCliente(idAtualizar, {
                    nome: novoNome,
                    idade: novaIdade,
                    telefone: novoTelefone,
                    email: novoEmail,
                    endereco: novoEndereco
                })) {
                    console.log("Cliente atualizado com sucesso!");
                } else {
                    console.log("Erro ao atualizar cliente!");
                }
                break;
                
            case 4: // EXCLUIR CLIENTE
                console.clear();
                const idExcluir = Number(prompt("ID do cliente para excluir: "));
                if (excluirCliente(idExcluir)) {
                    console.log("Cliente excluído com sucesso!");
                } else {
                    console.log("Cliente não encontrado!");
                }
                break;
                
            case 5: // VOLTAR AO MENU ANTERIOR
                loop = false;
                break;
                
            default:
                console.log("Opção inválida");
                break;
        }
        
        // PAUSA ENTRE OPERAÇÕES
        if (loop && resposta !== 5) {
            prompt("Pressione Enter para continuar...");
            console.clear();
        }
    }
}

/**
 * FUNÇÃO DE GERENCIAMENTO DE PRODUTOS
 * Submenu completo para operações CRUD de produtos
 */
function gerenciarProdutos() {
    let loop = true;
    while (loop) {
        console.clear();
        console.log("======= GERENCIAR PRODUTOS ==========");
        console.log("1) Novo produto");
        console.log("2) Listar produtos");
        console.log("3) Atualizar produto");
        console.log("4) Excluir produto");
        console.log("5) Voltar");
        const resposta = Number(prompt("Escolha: "));
        
        switch (resposta) {
            case 1: // CADASTRAR NOVO PRODUTO
                console.clear();
                console.log("======= CADASTRO PRODUTO ==========");
                // Coleta dados do produto
                const produto = prompt("Digite nome do produto: ");
                const tipo = prompt("Digite o tipo do produto: ").toLowerCase();
                const valor = Number(prompt("Digite o valor do produto: "));
                const quantidade = Number(prompt("Digite a quantidade no estoque: "));
                
                try {
                    const id = inserirProduto(produto, tipo, valor, quantidade);
                    console.log(`Novo produto criado! id: ${id}`);
                } catch (error) {
                    console.error("Erro ao cadastrar produto:", error);
                }
                break;
                
            case 2: // LISTAR PRODUTOS (incluindo inativos)
                try {
                    console.clear();
                    const produtos = listarProdutos(false); // false = mostra todos os produtos
                    console.log("======= PRODUTOS CADASTRADOS ==========");
                    console.table(produtos);
                } catch (error) {
                    console.error("Erro ao listar produtos:", error);
                }
                break;
                
            case 3: // ATUALIZAR PRODUTO
                console.clear();
                const idAtualizar = Number(prompt("ID do produto para atualizar: "));
                const produtoAntigo = listarProdutos(false).find(p => p.id === idAtualizar);
                
                if (!produtoAntigo) {
                    console.log("Produto não encontrado!");
                    break;
                }
                
                // Interface de atualização com valores atuais
                console.log("Deixe em branco para manter o valor atual");
                const novoProduto = prompt(`Nome [${produtoAntigo.produto}]: `) || produtoAntigo.produto;
                const novoTipo = prompt(`Tipo [${produtoAntigo.tipo}]: `) || produtoAntigo.tipo;
                const novoValor = Number(prompt(`Valor [${produtoAntigo.valor}]: `) || produtoAntigo.valor);
                const novaQuantidade = Number(prompt(`Quantidade [${produtoAntigo.quantidade}]: `) || produtoAntigo.quantidade);
                
                if (atualizarProduto(idAtualizar, {
                    produto: novoProduto,
                    tipo: novoTipo,
                    valor: novoValor,
                    quantidade: novaQuantidade
                })) {
                    console.log("Produto atualizado com sucesso!");
                } else {
                    console.log("Erro ao atualizar produto!");
                }
                break;
                
            case 4: // EXCLUIR PRODUTO (exclusão lógica)
                console.clear();
                const idExcluir = Number(prompt("ID do produto para excluir: "));
                if (excluirProduto(idExcluir)) {
                    console.log("Produto excluído com sucesso!");
                } else {
                    console.log("Produto não encontrado!");
                }
                break;
                
            case 5: // VOLTAR
                loop = false;
                break;
                
            default:
                console.log("Opção inválida");
                break;
        }
        
        // PAUSA ENTRE OPERAÇÕES
        if (loop && resposta !== 5) {
            prompt("Pressione Enter para continuar...");
            console.clear();
        }
    }
}

// INICIALIZAÇÃO DA APLICAÇÃO
main().catch(console.error); // Executa a função principal e trata erros
