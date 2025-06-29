-- Criação das tabelas principais do sistema de requisições (Versão 2)

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('solicitante', 'estoquista', 'entregador', 'admin')),
    setor VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos/itens
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    unidade VARCHAR(50) NOT NULL,
    estoque_atual DECIMAL(10,2) DEFAULT 0,
    estoque_minimo DECIMAL(10,2) DEFAULT 0,
    consumo_medio_diario DECIMAL(10,2) DEFAULT 0,
    preco_unitario DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de setores
CREATE TABLE setores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    responsavel_id INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de requisições
CREATE TABLE requisicoes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    solicitante_id INTEGER NOT NULL REFERENCES usuarios(id),
    setor_id INTEGER NOT NULL REFERENCES setores(id),
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega_prevista DATE NOT NULL,
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite')),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'em_separacao', 'separado', 'em_entrega', 'entregue', 'cancelada')),
    observacoes TEXT,
    aprovado_por INTEGER REFERENCES usuarios(id),
    data_aprovacao TIMESTAMP,
    separado_por INTEGER REFERENCES usuarios(id),
    data_separacao TIMESTAMP,
    entregue_por INTEGER REFERENCES usuarios(id),
    data_entrega TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da requisição
CREATE TABLE requisicao_itens (
    id SERIAL PRIMARY KEY,
    requisicao_id INTEGER NOT NULL REFERENCES requisicoes(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade_solicitada DECIMAL(10,2) NOT NULL,
    quantidade_atual_estoque DECIMAL(10,2) NOT NULL,
    quantidade_separada DECIMAL(10,2) DEFAULT 0,
    quantidade_entregue DECIMAL(10,2) DEFAULT 0,
    status_item VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status_item IN ('pendente', 'separado', 'entregue', 'parcial', 'em_falta')),
    observacoes TEXT,
    preco_unitario DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico/auditoria
CREATE TABLE historico_requisicoes (
    id SERIAL PRIMARY KEY,
    requisicao_id INTEGER NOT NULL REFERENCES requisicoes(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    detalhes JSONB,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentação de estoque
CREATE TABLE movimentacao_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    tipo_movimentacao VARCHAR(50) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste', 'separacao', 'entrega')),
    quantidade DECIMAL(10,2) NOT NULL,
    quantidade_anterior DECIMAL(10,2) NOT NULL,
    quantidade_atual DECIMAL(10,2) NOT NULL,
    requisicao_id INTEGER REFERENCES requisicoes(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_requisicoes_solicitante ON requisicoes(solicitante_id);
CREATE INDEX idx_requisicoes_status ON requisicoes(status);
CREATE INDEX idx_requisicoes_data_entrega ON requisicoes(data_entrega_prevista);
CREATE INDEX idx_requisicao_itens_requisicao ON requisicao_itens(requisicao_id);
CREATE INDEX idx_requisicao_itens_produto ON requisicao_itens(produto_id);
CREATE INDEX idx_historico_requisicao ON historico_requisicoes(requisicao_id);
CREATE INDEX idx_movimentacao_produto ON movimentacao_estoque(produto_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE produtos IS 'Catálogo de produtos e insumos';
COMMENT ON TABLE setores IS 'Setores do restaurante';
COMMENT ON TABLE requisicoes IS 'Requisições de estoque';
COMMENT ON TABLE requisicao_itens IS 'Itens de cada requisição';
COMMENT ON TABLE historico_requisicoes IS 'Log de mudanças nas requisições';
COMMENT ON TABLE movimentacao_estoque IS 'Controle de movimentação de estoque';
