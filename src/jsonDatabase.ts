// Importa funções do módulo File System para manipulação de arquivos
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
// Importa função para trabalhar com caminhos de arquivos
import { join } from "path";

// Define o diretório onde os arquivos de dados serão armazenados
const DATA_DIR = "./data";

// Garante que a pasta data existe - cria se não existir
if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR); // Cria o diretório de forma síncrona
}

/**
 * Função para carregar dados de um arquivo JSON
 * @param filename - Nome do arquivo (ex: "clientes.json")
 * @returns Array de dados do tipo especificado
 * @template T - Tipo genérico para tipagem dos dados
 */
export function loadData<T>(filename: string): T[] {
    // Constrói o caminho completo do arquivo
    const filePath = join(DATA_DIR, filename);
    
    // Se o arquivo não existe, cria um com array vazio
    if (!existsSync(filePath)) {
        writeFileSync(filePath, "[]", "utf-8");
    }
    
    // Lê o conteúdo do arquivo com codificação UTF-8
    const data = readFileSync(filePath, "utf-8");
    
    // Converte o JSON stringificado de volta para objeto JavaScript
    return JSON.parse(data) as T[];
}

/**
 * Função para salvar dados em um arquivo JSON
 * @param filename - Nome do arquivo onde salvar os dados
 * @param data - Array de dados a serem salvos
 * @template T - Tipo genérico para garantir consistência de tipos
 */
export function saveData<T>(filename: string, data: T[]): void {
    // Constrói o caminho completo do arquivo
    const filePath = join(DATA_DIR, filename);
    
    // Salva os dados no arquivo com formatação legível
    writeFileSync(
        filePath,
        JSON.stringify(data, null, 2), // Converte para JSON com indentação de 2 espaços
        "utf-8"
    );
}
