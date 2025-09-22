// [file name]: relatorio.ts
// 🔧 ARQUIVO MODIFICADO - Corrigindo importação

import { loadData } from "./jsonDatabase";
import { Pedido } from "./tipos";
import { obterHistoricoPorPeriodo, obterHistoricoPorCliente, obterEstatisticasCliente } from "./historicoService";
import { formatarMoeda, formatarData } from "./utils";

/**
 * Função principal para gerar relatórios baseados no histórico de pedidos
 * @param tipo - Tipo de relatório: "mes", "dia", "cliente" ou "personalizado"
 * @param filtro - Objeto com parâmetros específicos para cada tipo de relatório
 */
export function gerarRelatorio(tipo: "mes" | "dia" | "cliente" | "personalizado", filtro?: any) {
    // Carrega o histórico completo de pedidos
    const historico = loadData<Pedido>("historico.json");

    // Verifica se existem pedidos no histórico
    if (historico.length === 0) {
        console.log("Nenhum pedido no histórico.");
        return;
    }

    // Roteamento para o tipo de relatório solicitado
    switch (tipo) {
        case "mes":
            gerarRelatorioMensal(historico);
            break;
        case "dia":
            gerarRelatorioDiario(historico);
            break;
        case "cliente":
            // Validação do filtro para relatório de cliente
            if (!filtro || !filtro.clienteId) {
                console.log("ID do cliente é necessário para este relatório");
                return;
            }
            gerarRelatorioCliente(filtro.clienteId);
            break;
        case "personalizado":
            // Validação do filtro para relatório personalizado
            if (!filtro || !filtro.dataInicio || !filtro.dataFim) {
                console.log("Datas de início e fim são necessárias para este relatório");
                return;
            }
            gerarRelatorioPersonalizado(new Date(filtro.dataInicio), new Date(filtro.dataFim));
            break;
        default:
            console.log("Tipo de relatório não reconhecido");
    }
}

/**
 * Gera relatório mensal com estatísticas detalhadas por mês
 * @param historico - Array completo de pedidos históricos
 */
function gerarRelatorioMensal(historico: Pedido[]) {
    // Estrutura para agrupar dados por mês
    const porMes: { [key: string]: { 
        total: number,         // Valor total vendido no mês
        pedidos: number,       // Quantidade de pedidos no mês
        produtos: {[key: string]: number}  // Quantidade de cada produto vendido
    } } = {};
    
    // Processa cada pedido do histórico
    historico.forEach(p => {
        // Extrai o mês no formato YYYY-MM (ex: "2024-01")
        const mes = new Date(p.data).toISOString().slice(0, 7);
        
        // Inicializa a estrutura do mês se não existir
        if (!porMes[mes]) {
            porMes[mes] = { total: 0, pedidos: 0, produtos: {} };
        }
        
        // Acumula valores do pedido
        porMes[mes].total += p.total;
        porMes[mes].pedidos += 1;
        
        // Contabiliza produtos vendidos no pedido
        p.itens.forEach(item => {
            porMes[mes].produtos[item.nome] = (porMes[mes].produtos[item.nome] || 0) + item.quantidade;
        });
    });
    
    // Exibe o relatório formatado
    console.log("======= RELATÓRIO POR MÊS =======");
    for (const mes in porMes) {
        console.log(`\n--- ${mes} ---`);
        console.log(`Total de vendas: ${formatarMoeda(porMes[mes].total)}`);
        console.log(`Número de pedidos: ${porMes[mes].pedidos}`);
        console.log("Produtos vendidos:");
        
        // Lista produtos e quantidades do mês
        for (const produto in porMes[mes].produtos) {
            console.log(`  ${produto}: ${porMes[mes].produtos[produto]} unidades`);
        }
    }
}

/**
 * Gera relatório diário com totais por dia
 * @param historico - Array completo de pedidos históricos
 */
function gerarRelatorioDiario(historico: Pedido[]) {
    // Estrutura para agrupar dados por dia
    const porDia: { [key: string]: { 
        total: number,     // Valor total vendido no dia
        pedidos: number    // Quantidade de pedidos no dia
    } } = {};
    
    // Processa cada pedido
    historico.forEach(p => {
        // Extrai a data no formato YYYY-MM-DD (ex: "2024-01-15")
        const dia = new Date(p.data).toISOString().slice(0, 10);
        
        // Inicializa ou atualiza os dados do dia
        porDia[dia] = porDia[dia] || { total: 0, pedidos: 0 };
        porDia[dia].total += p.total;
        porDia[dia].pedidos += 1;
    });
    
    // Exibe em formato de tabela para melhor visualização
    console.log("======= RELATÓRIO POR DIA =======");
    console.table(porDia);
}

/**
 * Gera relatório detalhado de um cliente específico
 * @param clienteId - ID do cliente para gerar o relatório
 */
function gerarRelatorioCliente(clienteId: number) {
    // Obtém dados específicos do cliente
    const historicoCliente = obterHistoricoPorCliente(clienteId);
    const estatisticas = obterEstatisticasCliente(clienteId);
    
    console.log("======= RELATÓRIO DO CLIENTE =======");
    console.log(`ID do Cliente: ${clienteId}`);
    console.log(`Total de pedidos: ${estatisticas.totalPedidos}`);
    console.log(`Total gasto: ${formatarMoeda(estatisticas.totalGasto)}`);
    console.log(`Ticket médio: ${formatarMoeda(estatisticas.ticketMedio)}`); // Média de gasto por pedido
    
    console.log("\nProdutos comprados:");
    // Lista produtos adquiridos pelo cliente
    for (const produto in estatisticas.produtosComprados) {
        console.log(`  ${produto}: ${estatisticas.produtosComprados[produto]} unidades`);
    }
    
    // Exibe os últimos 5 pedidos do cliente
    console.log("\nÚltimos pedidos:");
    historicoCliente.slice(-5).forEach(pedido => {
        console.log(`\nPedido #${pedido.id} - ${formatarData(pedido.data)}`);
        console.log(`Total: ${formatarMoeda(pedido.total)}`);
        console.log(`Forma de pagamento: ${pedido.pagamento}`);
    });
}

/**
 * Gera relatório personalizado para um período específico
 * @param dataInicio - Data de início do período
 * @param dataFim - Data de fim do período
 */
function gerarRelatorioPersonalizado(dataInicio: Date, dataFim: Date) {
    // Obtém pedidos dentro do período especificado
    const historicoPeriodo = obterHistoricoPorPeriodo(dataInicio, dataFim);
    
    // Variáveis para acumular estatísticas
    let totalPeriodo = 0;
    let totalPedidos = historicoPeriodo.length;
    const produtosVendidos: {[key: string]: number} = {};
    const formasPagamento: {[key: string]: number} = {};
    
    // Processa cada pedido do período
    historicoPeriodo.forEach(pedido => {
        totalPeriodo += pedido.total;
        
        // Contabiliza formas de pagamento utilizadas
        formasPagamento[pedido.pagamento] = (formasPagamento[pedido.pagamento] || 0) + 1;
        
        // Contabiliza produtos vendidos
        pedido.itens.forEach(item => {
            produtosVendidos[item.nome] = (produtosVendidos[item.nome] || 0) + item.quantidade;
        });
    });
    
    console.log("======= RELATÓRIO PERSONALIZADO =======");
    console.log(`Período: ${formatarData(dataInicio.toISOString())} à ${formatarData(dataFim.toISOString())}`);
    console.log(`Total de vendas: ${formatarMoeda(totalPeriodo)}`);
    console.log(`Número de pedidos: ${totalPedidos}`);
    
    console.log("\nFormas de pagamento:");
    for (const forma in formasPagamento) {
        console.log(`  ${forma}: ${formasPagamento[forma]} pedidos`);
    }
    
    console.log("\nProdutos vendidos:");
    for (const produto in produtosVendidos) {
        console.log(`  ${produto}: ${produtosVendidos[produto]} unidades`);
    }
}
