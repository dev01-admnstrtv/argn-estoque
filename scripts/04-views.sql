-- Views úteis para relatórios e consultas

-- View para requisições com detalhes completos
CREATE VIEW vw_requisicoes_completas AS
SELECT 
    r.id,
    r.codigo,
    r.status,
    r.data_solicitacao,
    r.data_entrega_prevista,
    r.turno,
    r.observacoes,
    u_sol.nome as solicitante_nome,
    u_sol.email as solicitante_email,
    s.nome as setor_nome,
    u_apr.nome as aprovado_por_nome,
    u_sep.nome as separado_por_nome,
    u_ent.nome as entregue_por_nome,
    COUNT(ri.id) as total_itens,
    COUNT(CASE WHEN ri.status_item = 'pendente' THEN 1 END) as itens_pendentes,
    COUNT(CASE WHEN ri.status_item = 'separado' THEN 1 END) as itens_separados,
    COUNT(CASE WHEN ri.status_item = 'entregue' THEN 1 END) as itens_entregues,
    SUM(ri.quantidade_solicitada * ri.preco_unitario) as valor_total
FROM requisicoes r
JOIN usuarios u_sol ON r.solicitante_id = u_sol.id
JOIN setores s ON r.setor_id = s.id
LEFT JOIN usuarios u_apr ON r.aprovado_por = u_apr.id
LEFT JOIN usuarios u_sep ON r.separado_por = u_sep.id
LEFT JOIN usuarios u_ent ON r.entregue_por = u_ent.id
LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
GROUP BY r.id, u_sol.nome, u_sol.email, s.nome, u_apr.nome, u_sep.nome, u_ent.nome;

-- View para produtos com informações de estoque
CREATE VIEW vw_produtos_estoque AS
SELECT 
    p.id,
    p.nome,
    p.categoria,
    p.unidade,
    p.estoque_atual,
    p.estoque_minimo,
    p.consumo_medio_diario,
    p.preco_unitario,
    CASE 
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'CRITICO'
        WHEN p.estoque_atual <= (p.estoque_minimo * 1.5) THEN 'BAIXO'
        ELSE 'NORMAL'
    END as status_estoque,
    ROUND(p.estoque_atual / NULLIF(p.consumo_medio_diario, 0), 1) as dias_restantes,
    COALESCE(SUM(ri.quantidade_solicitada - ri.quantidade_entregue), 0) as quantidade_pendente
FROM produtos p
LEFT JOIN requisicao_itens ri ON p.id = ri.produto_id 
    AND ri.requisicao_id IN (
        SELECT id FROM requisicoes 
        WHERE status IN ('aprovada', 'em_separacao', 'separado', 'em_entrega')
    )
WHERE p.ativo = true
GROUP BY p.id, p.nome, p.categoria, p.unidade, p.estoque_atual, p.estoque_minimo, p.consumo_medio_diario, p.preco_unitario;

-- View para dashboard de estatísticas
CREATE VIEW vw_dashboard_stats AS
SELECT 
    COUNT(CASE WHEN r.status = 'pendente' THEN 1 END) as requisicoes_pendentes,
    COUNT(CASE WHEN r.status = 'aprovada' THEN 1 END) as requisicoes_aprovadas,
    COUNT(CASE WHEN r.status = 'em_separacao' THEN 1 END) as requisicoes_em_separacao,
    COUNT(CASE WHEN r.status = 'separado' THEN 1 END) as requisicoes_separadas,
    COUNT(CASE WHEN r.status = 'em_entrega' THEN 1 END) as requisicoes_em_entrega,
    COUNT(CASE WHEN r.status = 'entregue' THEN 1 END) as requisicoes_entregues,
    COUNT(CASE WHEN r.data_solicitacao::date = CURRENT_DATE THEN 1 END) as requisicoes_hoje,
    COUNT(CASE WHEN p.status_estoque = 'CRITICO' THEN 1 END) as produtos_criticos,
    COUNT(CASE WHEN p.status_estoque = 'BAIXO' THEN 1 END) as produtos_baixo_estoque
FROM requisicoes r
CROSS JOIN vw_produtos_estoque p;
