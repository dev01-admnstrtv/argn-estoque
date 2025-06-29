-- Script para limpar todas as tabelas e recomeçar

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
DROP TRIGGER IF EXISTS update_requisicoes_updated_at ON requisicoes;
DROP TRIGGER IF EXISTS update_requisicao_itens_updated_at ON requisicao_itens;
DROP TRIGGER IF EXISTS generate_requisicao_codigo_trigger ON requisicoes;
DROP TRIGGER IF EXISTS log_requisicao_changes_trigger ON requisicoes;
DROP TRIGGER IF EXISTS update_estoque_on_separacao_trigger ON requisicao_itens;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_requisicao_codigo();
DROP FUNCTION IF EXISTS log_requisicao_changes();
DROP FUNCTION IF EXISTS update_estoque_on_separacao();

-- Remover views
DROP VIEW IF EXISTS vw_requisicoes_completas;
DROP VIEW IF EXISTS vw_produtos_estoque;
DROP VIEW IF EXISTS vw_dashboard_stats;

-- Remover tabelas (ordem inversa devido às foreign keys)
DROP TABLE IF EXISTS movimentacao_estoque CASCADE;
DROP TABLE IF EXISTS historico_requisicoes CASCADE;
DROP TABLE IF EXISTS requisicao_itens CASCADE;
DROP TABLE IF EXISTS requisicoes CASCADE;
DROP TABLE IF EXISTS setores CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Remover sequences se existirem
DROP SEQUENCE IF EXISTS usuarios_id_seq CASCADE;
DROP SEQUENCE IF EXISTS produtos_id_seq CASCADE;
DROP SEQUENCE IF EXISTS setores_id_seq CASCADE;
DROP SEQUENCE IF EXISTS requisicoes_id_seq CASCADE;
DROP SEQUENCE IF EXISTS requisicao_itens_id_seq CASCADE;
DROP SEQUENCE IF EXISTS historico_requisicoes_id_seq CASCADE;
DROP SEQUENCE IF EXISTS movimentacao_estoque_id_seq CASCADE;
