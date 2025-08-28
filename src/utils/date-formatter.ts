// Função para formatar datas no fuso horário de Brasília
export const formatDateBR = (dateString: string) => {
    const date = new Date(dateString);

    // Converter para fuso horário de Brasília (UTC-3)
    const brasiliaDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    }).format(brasiliaDate);
};

// Função para formatar apenas o horário no fuso de Brasília
export const formatTimeBR = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    }).format(date);
};

// Função para formatar apenas a data no fuso de Brasília
export const formatDateOnlyBR = (dateString: string) => {
    // Para datas no formato YYYY-MM-DD, adicionar horário para evitar problemas de timezone
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T12:00:00');

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
    }).format(date);
};

// Função para obter a data atual no fuso de Brasília
export const getCurrentDateBR = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Sao_Paulo'
    }).format(now);
};

// Função para obter o timestamp atual no fuso de Brasília
export const getCurrentTimestampBR = () => {
    const now = new Date();
    return now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
};
