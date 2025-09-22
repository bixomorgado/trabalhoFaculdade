// [file name]: utils.ts
// ✅ NOVO ARQUIVO - Funções utilitárias

/**
 * Formata um valor numérico para o padrão monetário brasileiro (R$)
 * @param valor - Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira (ex: "R$ 1.234,56")
 * 
 * @example
 * formatarMoeda(1234.56) // Retorna "R$ 1.234,56"
 * formatarMoeda(99.9)    // Retorna "R$ 99,90"
 */
export function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formata uma data no formato ISO para o padrão brasileiro (DD/MM/AAAA)
 * @param dataISO - Data em formato ISO string (ex: "2024-01-15T10:30:00.000Z")
 * @returns Data formatada no padrão brasileiro (ex: "15/01/2024")
 * 
 * @example
 * formatarData("2024-01-15T10:30:00.000Z") // Retorna "15/01/2024"
 */
export function formatarData(dataISO: string): string {
    return new Date(dataISO).toLocaleDateString('pt-BR');
}

/**
 * Valida se um CPF é válido de acordo com as regras da Receita Federal
 * Inclui verificação de dígitos verificadores e casos especiais
 * @param cpf - Número do CPF (pode ter menos de 11 dígitos, será preenchido com zeros à esquerda)
 * @returns true se o CPF é válido, false caso contrário
 * 
 * @example
 * validarCPF(12345678909) // Retorna true (CPF válido)
 * validarCPF(11111111111) // Retorna false (CPF inválido)
 */
export function validarCPF(cpf: number): boolean {
    // Converte para string e preenche com zeros à esquerda para ter 11 dígitos
    const cpfStr = cpf.toString().padStart(11, '0');
    
    // Verifica se tem 11 dígitos e não é uma sequência repetida (ex: 111.111.111-11)
    if (cpfStr.length !== 11 || /^(\d)\1{10}$/.test(cpfStr)) {
        return false;
    }
    
    // ===== VALIDAÇÃO DO PRIMEIRO DÍGITO VERIFICADOR =====
    let soma = 0;
    // Calcula a soma ponderada dos primeiros 9 dígitos
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfStr.charAt(i)) * (10 - i);
    }
    
    // Calcula o resto e ajusta para dígito único
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    
    // Verifica se o primeiro dígito verificador está correto
    if (resto !== parseInt(cpfStr.charAt(9))) return false;
    
    // ===== VALIDAÇÃO DO SEGUNDO DÍGITO VERIFICADOR =====
    soma = 0;
    // Calcula a soma ponderada dos primeiros 10 dígitos
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfStr.charAt(i)) * (11 - i);
    }
    
    // Calcula o resto e ajusta para dígito único
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    
    // Verifica se o segundo dígito verificador está correto
    if (resto !== parseInt(cpfStr.charAt(10))) return false;
    
    // CPF válido se passou por todas as verificações
    return true;
}

/**
 * Valida se um email possui formato válido
 * Verifica a estrutura básica: local-part@domain.tld
 * @param email - String contendo o email a ser validado
 * @returns true se o email é válido, false caso contrário
 * 
 * @example
 * validarEmail("usuario@exemplo.com") // Retorna true
 * validarEmail("usuario@exemplo")     // Retorna false
 * validarEmail("usuario.exemplo.com") // Retorna false
 */
export function validarEmail(email: string): boolean {
    // Regex para validar formato básico de email:
    // - local-part: um ou mais caracteres que não sejam espaços ou @
    // - @: símbolo obrigatório
    // - domain: um ou mais caracteres que não sejam espaços ou @
    // - .: ponto obrigatório
    // - tld: um ou mais caracteres que não sejam espaços ou @
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Formata uma data ISO incluindo data e hora completas no padrão brasileiro
 * @param dataISO - Data em formato ISO string
 * @returns Data e hora formatadas (ex: "15/01/2024, 10:30:00")
 * 
 * @example
 * formatarDataCompleta("2024-01-15T10:30:00.000Z") // Retorna "15/01/2024, 10:30:00"
 */
export function formatarDataCompleta(dataISO: string): string {
    return new Date(dataISO).toLocaleString('pt-BR');
}
