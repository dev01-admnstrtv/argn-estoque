-- Inserção de dados iniciais

-- Inserir setores
INSERT INTO setores (nome, descricao) VALUES
('Setor de Saladas', 'Responsável pela preparação de saladas e pratos frios'),
('Fogão', 'Setor de preparação de pratos quentes'),
('Fritadeira', 'Setor especializado em frituras'),
('Entradas', 'Preparação de entradas e aperitivos'),
('Bar', 'Setor de bebidas e drinks'),
('Salão', 'Atendimento ao cliente'),
('Limpeza', 'Manutenção e limpeza do estabelecimento');

-- Inserir usuários (senha: 123456)
INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, setor) VALUES
('Maria Silva', 'maria@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Setor de Saladas'),
('João Santos', 'joao@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Bar'),
('Carlos Oliveira', 'carlos@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Fogão'),
('Ana Costa', 'ana@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Limpeza'),
('Pedro Lima', 'pedro@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Fritadeira'),
('Lucia Ferreira', 'lucia@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'solicitante', 'Entradas'),
('Roberto Estoque', 'estoque@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'estoquista', NULL),
('Sandra Entrega', 'entrega@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'entregador', NULL),
('Admin Sistema', 'admin@aragon.com', '$2b$10$rQ8K5O.6WjANXkfTjbQa6eJ9X8YvZ2nF4mP1sL7dR3cV6bN9hG8kS', 'admin', NULL);

-- Inserir produtos
INSERT INTO produtos (nome, categoria, unidade, estoque_atual, estoque_minimo, consumo_medio_diario, preco_unitario) VALUES
('Alface Americana', 'Verduras', 'kg', 15.5, 5.0, 2.5, 8.50),
('Tomate Cereja', 'Verduras', 'kg', 8.2, 3.0, 1.8, 12.00),
('Cenoura', 'Verduras', 'kg', 12.0, 4.0, 1.2, 6.50),
('Pepino', 'Verduras', 'kg', 6.8, 2.0, 0.8, 7.20),
('Rúcula', 'Verduras', 'maço', 25, 10, 15, 3.50),
('Azeite Extra Virgem', 'Condimentos', 'L', 8.5, 2.0, 0.5, 45.00),
('Vinagre Balsâmico', 'Condimentos', 'L', 4.2, 1.0, 0.3, 35.00),
('Queijo Parmesão', 'Laticínios', 'kg', 3.8, 1.0, 0.4, 85.00),
('Mussarela de Búfala', 'Laticínios', 'kg', 5.2, 1.5, 0.6, 65.00),
('Croutons', 'Acompanhamentos', 'pacote', 12, 5, 3, 15.50),
('Limão', 'Frutas', 'kg', 8.0, 3.0, 2.0, 8.00),
('Gelo', 'Bebidas', 'kg', 50.0, 20.0, 15.0, 2.50),
('Óleo de Soja', 'Condimentos', 'L', 15.0, 5.0, 2.0, 12.00),
('Sal', 'Condimentos', 'kg', 25.0, 5.0, 1.0, 3.50),
('Cebola', 'Verduras', 'kg', 20.0, 8.0, 3.0, 5.50),
('Queijo Brie', 'Laticínios', 'kg', 2.5, 0.5, 0.8, 120.00),
('Pão Francês', 'Padaria', 'unidade', 100, 30, 20, 0.80),
('Detergente', 'Limpeza', 'L', 8.0, 3.0, 1.0, 8.50),
('Óleo para Fritura', 'Condimentos', 'L', 20.0, 8.0, 5.0, 18.00),
('Batata', 'Verduras', 'kg', 35.0, 15.0, 10.0, 4.50);

-- Inserir algumas requisições de exemplo
INSERT INTO requisicoes (codigo, solicitante_id, setor_id, data_entrega_prevista, turno, status, observacoes) VALUES
('REQ-001', 1, 1, CURRENT_DATE + INTERVAL '1 day', 'manha', 'entregue', 'Urgente para o almoço de hoje'),
('REQ-002', 2, 5, CURRENT_DATE + INTERVAL '1 day', 'tarde', 'em_separacao', 'Para o happy hour'),
('REQ-003', 3, 2, CURRENT_DATE, 'noite', 'entregue', 'Jantar especial'),
('REQ-004', 4, 7, CURRENT_DATE + INTERVAL '1 day', 'manha', 'cancelada', 'Produto em falta'),
('REQ-005', 5, 3, CURRENT_DATE, 'tarde', 'entregue', 'Batatas para fritura'),
('REQ-006', 6, 4, CURRENT_DATE + INTERVAL '1 day', 'manha', 'separado', 'Entrada especial');

-- Inserir itens das requisições
INSERT INTO requisicao_itens (requisicao_id, produto_id, quantidade_solicitada, quantidade_atual_estoque, quantidade_separada, quantidade_entregue, status_item, preco_unitario) VALUES
-- REQ-001 (entregue)
(1, 1, 3.0, 15.5, 2.5, 2.5, 'entregue', 8.50),
(1, 2, 2.0, 8.2, 1.8, 1.8, 'entregue', 12.00),
-- REQ-002 (em_separacao)
(2, 11, 5.0, 8.0, 3.0, 0.0, 'separado', 8.00),
(2, 12, 10.0, 50.0, 0.0, 0.0, 'pendente', 2.50),
-- REQ-003 (entregue)
(3, 13, 2.0, 15.0, 1.5, 1.5, 'entregue', 12.00),
(3, 14, 1.0, 25.0, 0.8, 0.8, 'entregue', 3.50),
(3, 15, 3.0, 20.0, 2.5, 2.5, 'entregue', 5.50),
-- REQ-004 (cancelada)
(4, 18, 3.0, 8.0, 0.0, 0.0, 'em_falta', 8.50),
-- REQ-005 (entregue)
(5, 19, 5.0, 20.0, 4.5, 4.5, 'entregue', 18.00),
(5, 20, 10.0, 35.0, 9.0, 9.0, 'entregue', 4.50),
-- REQ-006 (separado)
(6, 16, 1.0, 2.5, 0.8, 0.0, 'separado', 120.00),
(6, 17, 20.0, 100.0, 18.0, 0.0, 'separado', 0.80);
