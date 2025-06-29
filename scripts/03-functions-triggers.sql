-- Funções e triggers para automação

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requisicoes_updated_at BEFORE UPDATE ON requisicoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requisicao_itens_updated_at BEFORE UPDATE ON requisicao_itens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código da requisição
CREATE OR REPLACE FUNCTION generate_requisicao_codigo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'REQ-' || LPAD(nextval('requisicoes_id_seq')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar código automaticamente
CREATE TRIGGER generate_requisicao_codigo_trigger 
    BEFORE INSERT ON requisicoes 
    FOR EACH ROW EXECUTE FUNCTION generate_requisicao_codigo();

-- Função para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION log_requisicao_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para mudanças de status
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO historico_requisicoes (
            requisicao_id, 
            usuario_id, 
            acao, 
            status_anterior, 
            status_novo,
            detalhes
        ) VALUES (
            NEW.id,
            COALESCE(NEW.aprovado_por, NEW.separado_por, NEW.entregue_por, NEW.solicitante_id),
            'mudanca_status',
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'data_anterior', OLD.updated_at,
                'data_nova', NEW.updated_at
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para log automático
CREATE TRIGGER log_requisicao_changes_trigger 
    AFTER UPDATE ON requisicoes 
    FOR EACH ROW EXECUTE FUNCTION log_requisicao_changes();

-- Função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION update_estoque_on_separacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando quantidade separada é alterada
    IF TG_OP = 'UPDATE' AND OLD.quantidade_separada != NEW.quantidade_separada THEN
        -- Registrar movimentação de estoque
        INSERT INTO movimentacao_estoque (
            produto_id,
            tipo_movimentacao,
            quantidade,
            quantidade_anterior,
            quantidade_atual,
            requisicao_id,
            usuario_id,
            observacoes
        ) VALUES (
            NEW.produto_id,
            'separacao',
            NEW.quantidade_separada - OLD.quantidade_separada,
            (SELECT estoque_atual FROM produtos WHERE id = NEW.produto_id),
            (SELECT estoque_atual FROM produtos WHERE id = NEW.produto_id) - (NEW.quantidade_separada - OLD.quantidade_separada),
            NEW.requisicao_id,
            1, -- ID do usuário do sistema
            'Separação automática via sistema'
        );
        
        -- Atualizar estoque do produto
        UPDATE produtos 
        SET estoque_atual = estoque_atual - (NEW.quantidade_separada - OLD.quantidade_separada)
        WHERE id = NEW.produto_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualização automática de estoque
CREATE TRIGGER update_estoque_on_separacao_trigger 
    AFTER UPDATE ON requisicao_itens 
    FOR EACH ROW EXECUTE FUNCTION update_estoque_on_separacao();
