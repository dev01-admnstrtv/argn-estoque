import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set")
}

export const sql = neon(process.env.DATABASE_URL)

// Tipos TypeScript para as tabelas
export interface Usuario {
  id: number
  nome: string
  email: string
  senha_hash: string
  tipo_usuario: "solicitante" | "estoquista" | "entregador" | "admin"
  setor?: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export interface Produto {
  id: number
  nome: string
  categoria: string
  unidade: string
  estoque_atual: number
  estoque_minimo: number
  consumo_medio_diario: number
  preco_unitario: number
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export interface Setor {
  id: number
  nome: string
  descricao?: string
  responsavel_id?: number
  ativo: boolean
  created_at: Date
}

export interface Requisicao {
  id: number
  codigo: string
  solicitante_id: number
  setor_id: number
  data_solicitacao: Date
  data_entrega_prevista: Date
  turno: "manha" | "tarde" | "noite"
  status: "pendente" | "aprovada" | "em_separacao" | "separado" | "em_entrega" | "entregue" | "cancelada"
  observacoes?: string
  aprovado_por?: number
  data_aprovacao?: Date
  separado_por?: number
  data_separacao?: Date
  entregue_por?: number
  data_entrega?: Date
  created_at: Date
  updated_at: Date
}

export interface RequisicaoItem {
  id: number
  requisicao_id: number
  produto_id: number
  quantidade_solicitada: number
  quantidade_atual_estoque: number
  quantidade_separada: number
  quantidade_entregue: number
  status_item: "pendente" | "separado" | "entregue" | "parcial" | "em_falta"
  observacoes?: string
  preco_unitario: number
  created_at: Date
  updated_at: Date
}

export interface HistoricoRequisicao {
  id: number
  requisicao_id: number
  usuario_id: number
  acao: string
  status_anterior?: string
  status_novo?: string
  detalhes?: any
  observacoes?: string
  created_at: Date
}

export interface MovimentacaoEstoque {
  id: number
  produto_id: number
  tipo_movimentacao: "entrada" | "saida" | "ajuste" | "separacao" | "entrega"
  quantidade: number
  quantidade_anterior: number
  quantidade_atual: number
  requisicao_id?: number
  usuario_id: number
  observacoes?: string
  created_at: Date
}

// Funções utilitárias para queries
export const queries = {
  // Usuários
  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    const result = await sql`
      SELECT * FROM usuarios WHERE email = ${email} AND ativo = true LIMIT 1
    `
    return result[0] || null
  },

  async createUsuario(usuario: Omit<Usuario, "id" | "created_at" | "updated_at">): Promise<Usuario> {
    const result = await sql`
      INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, setor, ativo)
      VALUES (${usuario.nome}, ${usuario.email}, ${usuario.senha_hash}, ${usuario.tipo_usuario}, ${usuario.setor}, ${usuario.ativo})
      RETURNING *
    `
    return result[0]
  },

  // Produtos
  async getProdutos(): Promise<Produto[]> {
    return await sql`
      SELECT * FROM produtos WHERE ativo = true ORDER BY categoria, nome
    `
  },

  async getProdutoById(id: number): Promise<Produto | null> {
    const result = await sql`
      SELECT * FROM produtos WHERE id = ${id} AND ativo = true LIMIT 1
    `
    return result[0] || null
  },

  // Setores
  async getSetores(): Promise<Setor[]> {
    return await sql`
      SELECT * FROM setores WHERE ativo = true ORDER BY nome
    `
  },

  // Requisições
  async getRequisicoes(filtros?: {
    status?: string
    solicitante_id?: number
    setor_id?: number
    data_inicio?: string
    data_fim?: string
  }): Promise<any[]> {
    if (!filtros || Object.keys(filtros).length === 0) {
      return await sql`
        SELECT r.*, 
               u.nome as solicitante_nome,
               s.nome as setor_nome,
               COUNT(ri.id) as total_itens
        FROM requisicoes r
        JOIN usuarios u ON r.solicitante_id = u.id
        JOIN setores s ON r.setor_id = s.id
        LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
        GROUP BY r.id, u.nome, s.nome
        ORDER BY r.data_solicitacao DESC
      `
    }

    const whereConditions: string[] = []
    const params: any[] = []

    if (filtros.status) {
      whereConditions.push(`r.status = $${params.length + 1}`)
      params.push(filtros.status)
    }

    if (filtros.solicitante_id) {
      whereConditions.push(`r.solicitante_id = $${params.length + 1}`)
      params.push(filtros.solicitante_id)
    }

    if (filtros.setor_id) {
      whereConditions.push(`r.setor_id = $${params.length + 1}`)
      params.push(filtros.setor_id)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    const query = `
      SELECT r.*, 
             u.nome as solicitante_nome,
             s.nome as setor_nome,
             COUNT(ri.id) as total_itens
      FROM requisicoes r
      JOIN usuarios u ON r.solicitante_id = u.id
      JOIN setores s ON r.setor_id = s.id
      LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
      ${whereClause}
      GROUP BY r.id, u.nome, s.nome
      ORDER BY r.data_solicitacao DESC
    `

    return await sql.query(query, params)
  },

  async getRequisicaoById(id: number): Promise<any | null> {
    const result = await sql`
      SELECT r.*, 
             u_sol.nome as solicitante_nome,
             s.nome as setor_nome
      FROM requisicoes r
      JOIN usuarios u_sol ON r.solicitante_id = u_sol.id
      JOIN setores s ON r.setor_id = s.id
      WHERE r.id = ${id}
      LIMIT 1
    `
    return result[0] || null
  },

  async getRequisicaoItens(requisicao_id: number): Promise<any[]> {
    return await sql`
      SELECT ri.*, p.nome as produto_nome, p.unidade
      FROM requisicao_itens ri
      JOIN produtos p ON ri.produto_id = p.id
      WHERE ri.requisicao_id = ${requisicao_id}
      ORDER BY p.nome
    `
  },

  async createRequisicao(requisicao: {
    solicitante_id: number
    setor_id: number
    data_entrega_prevista: string
    turno: string
    observacoes?: string
  }): Promise<Requisicao> {
    // Criar requisição com status 'pendente' - vai direto para separação
    const result = await sql`
      INSERT INTO requisicoes (solicitante_id, setor_id, data_entrega_prevista, turno, observacoes, status)
      VALUES (${requisicao.solicitante_id}, ${requisicao.setor_id}, ${requisicao.data_entrega_prevista}, ${requisicao.turno}, ${requisicao.observacoes}, 'pendente')
      RETURNING *
    `
    return result[0]
  },

  async createRequisicaoItem(item: {
    requisicao_id: number
    produto_id: number
    quantidade_solicitada: number
    quantidade_atual_estoque: number
    preco_unitario: number
  }): Promise<RequisicaoItem> {
    const result = await sql`
      INSERT INTO requisicao_itens (requisicao_id, produto_id, quantidade_solicitada, quantidade_atual_estoque, preco_unitario)
      VALUES (${item.requisicao_id}, ${item.produto_id}, ${item.quantidade_solicitada}, ${item.quantidade_atual_estoque}, ${item.preco_unitario})
      RETURNING *
    `
    return result[0]
  },

  // Função para buscar requisições para separação - CORRIGIDA
  async getRequisicoesParaSeparacao(filtros?: {
    status?: string
    setor_id?: number
  }): Promise<any[]> {
    try {
      // Buscar requisições pendentes (recém-criadas) e em_separacao (já iniciadas)
      let whereClause = "WHERE r.status IN ('pendente', 'em_separacao')"
      const params: any[] = []

      if (filtros?.status && filtros.status !== "todos") {
        whereClause = `WHERE r.status = $${params.length + 1}`
        params.push(filtros.status)
      }

      if (filtros?.setor_id) {
        whereClause += ` AND r.setor_id = $${params.length + 1}`
        params.push(filtros.setor_id)
      }

      const query = `
        SELECT r.*, 
               u.nome as solicitante_nome,
               s.nome as setor_nome,
               COUNT(ri.id) as total_itens,
               COUNT(CASE WHEN ri.status_item = 'pendente' THEN 1 END) as itens_pendentes,
               COUNT(CASE WHEN ri.status_item = 'separado' THEN 1 END) as itens_separados,
               COUNT(CASE WHEN ri.status_item = 'em_falta' THEN 1 END) as itens_em_falta
        FROM requisicoes r
        JOIN usuarios u ON r.solicitante_id = u.id
        JOIN setores s ON r.setor_id = s.id
        LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
        ${whereClause}
        GROUP BY r.id, u.nome, s.nome
        ORDER BY r.data_entrega_prevista ASC, r.created_at ASC
      `

      if (params.length > 0) {
        return await sql.query(query, params)
      } else {
        return await sql`
          SELECT r.*, 
                 u.nome as solicitante_nome,
                 s.nome as setor_nome,
                 COUNT(ri.id) as total_itens,
                 COUNT(CASE WHEN ri.status_item = 'pendente' THEN 1 END) as itens_pendentes,
                 COUNT(CASE WHEN ri.status_item = 'separado' THEN 1 END) as itens_separados,
                 COUNT(CASE WHEN ri.status_item = 'em_falta' THEN 1 END) as itens_em_falta
          FROM requisicoes r
          JOIN usuarios u ON r.solicitante_id = u.id
          JOIN setores s ON r.setor_id = s.id
          LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
          WHERE r.status IN ('pendente', 'em_separacao')
          GROUP BY r.id, u.nome, s.nome
          ORDER BY r.data_entrega_prevista ASC, r.created_at ASC
        `
      }
    } catch (error) {
      console.error("Erro ao buscar requisições para separação:", error)
      return []
    }
  },

  // Função para buscar requisições para entrega - CORRIGIDA
  async getRequisicoesParaEntrega(filtros?: {
    status?: string
    setor_id?: number
  }): Promise<any[]> {
    try {
      // Buscar requisições separadas (prontas para entrega) e em_entrega (já iniciadas)
      let whereClause = "WHERE r.status IN ('separado', 'em_entrega')"
      const params: any[] = []

      if (filtros?.status && filtros.status !== "todos") {
        whereClause = `WHERE r.status = $${params.length + 1}`
        params.push(filtros.status)
      }

      if (filtros?.setor_id) {
        whereClause += ` AND r.setor_id = $${params.length + 1}`
        params.push(filtros.setor_id)
      }

      const query = `
        SELECT r.*, 
               u.nome as solicitante_nome,
               s.nome as setor_nome,
               COUNT(ri.id) as total_itens,
               COUNT(CASE WHEN ri.status_item IN ('separado', 'parcial') THEN 1 END) as itens_pendentes_entrega,
               COUNT(CASE WHEN ri.status_item = 'entregue' THEN 1 END) as itens_entregues
        FROM requisicoes r
        JOIN usuarios u ON r.solicitante_id = u.id
        JOIN setores s ON r.setor_id = s.id
        LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
        ${whereClause}
        GROUP BY r.id, u.nome, s.nome
        HAVING COUNT(CASE WHEN ri.status_item IN ('separado', 'parcial') THEN 1 END) > 0
        ORDER BY r.data_entrega_prevista ASC, r.created_at ASC
      `

      if (params.length > 0) {
        return await sql.query(query, params)
      } else {
        return await sql`
          SELECT r.*, 
                 u.nome as solicitante_nome,
                 s.nome as setor_nome,
                 COUNT(ri.id) as total_itens,
                 COUNT(CASE WHEN ri.status_item IN ('separado', 'parcial') THEN 1 END) as itens_pendentes_entrega,
                 COUNT(CASE WHEN ri.status_item = 'entregue' THEN 1 END) as itens_entregues
          FROM requisicoes r
          JOIN usuarios u ON r.solicitante_id = u.id
          JOIN setores s ON r.setor_id = s.id
          LEFT JOIN requisicao_itens ri ON r.id = ri.requisicao_id
          WHERE r.status IN ('separado', 'em_entrega')
          GROUP BY r.id, u.nome, s.nome
          HAVING COUNT(CASE WHEN ri.status_item IN ('separado', 'parcial') THEN 1 END) > 0
          ORDER BY r.data_entrega_prevista ASC, r.created_at ASC
        `
      }
    } catch (error) {
      console.error("Erro ao buscar requisições para entrega:", error)
      return []
    }
  },

  async updateRequisicaoStatus(id: number, status: string, usuario_id?: number): Promise<void> {
    if (status === "aprovada" && usuario_id) {
      await sql`
        UPDATE requisicoes 
        SET status = ${status}, aprovado_por = ${usuario_id}, data_aprovacao = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    } else if (status === "separado" && usuario_id) {
      await sql`
        UPDATE requisicoes 
        SET status = ${status}, separado_por = ${usuario_id}, data_separacao = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    } else if (status === "entregue" && usuario_id) {
      await sql`
        UPDATE requisicoes 
        SET status = ${status}, entregue_por = ${usuario_id}, data_entrega = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE requisicoes 
        SET status = ${status}
        WHERE id = ${id}
      `
    }
  },

  async updateRequisicaoItem(id: number, updates: Partial<RequisicaoItem>): Promise<void> {
    const updateFields: string[] = []
    const values: any[] = []

    if (updates.quantidade_separada !== undefined) {
      updateFields.push(`quantidade_separada = $${values.length + 1}`)
      values.push(updates.quantidade_separada)
    }

    if (updates.quantidade_entregue !== undefined) {
      updateFields.push(`quantidade_entregue = $${values.length + 1}`)
      values.push(updates.quantidade_entregue)
    }

    if (updates.status_item !== undefined) {
      updateFields.push(`status_item = $${values.length + 1}`)
      values.push(updates.status_item)
    }

    if (updates.observacoes !== undefined) {
      updateFields.push(`observacoes = $${values.length + 1}`)
      values.push(updates.observacoes)
    }

    if (updateFields.length === 0) return

    const query = `
      UPDATE requisicao_itens 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length + 1}
    `

    values.push(id)
    await sql.query(query, values)

    // Após atualizar item, verificar se deve atualizar status da requisição
    await this.atualizarStatusRequisicaoAutomatico(updates.requisicao_id || id)
  },

  // Nova função para atualizar status da requisição automaticamente
  async atualizarStatusRequisicaoAutomatico(requisicao_id: number): Promise<void> {
    try {
      // Buscar informações dos itens da requisição
      const itens = await sql`
        SELECT 
          COUNT(*) as total_itens,
          COUNT(CASE WHEN status_item = 'pendente' THEN 1 END) as itens_pendentes,
          COUNT(CASE WHEN status_item = 'separado' THEN 1 END) as itens_separados,
          COUNT(CASE WHEN status_item = 'entregue' THEN 1 END) as itens_entregues,
          COUNT(CASE WHEN status_item = 'em_falta' THEN 1 END) as itens_em_falta
        FROM requisicao_itens 
        WHERE requisicao_id = ${requisicao_id}
      `

      const info = itens[0]
      const requisicao = await sql`SELECT status FROM requisicoes WHERE id = ${requisicao_id}`
      const statusAtual = requisicao[0]?.status

      // Lógica para atualizar status da requisição
      if (info.itens_pendentes > 0 && statusAtual === "pendente") {
        // Se começou a separar, muda para em_separacao
        await sql`UPDATE requisicoes SET status = 'em_separacao' WHERE id = ${requisicao_id}`
      } else if (
        info.itens_pendentes === 0 &&
        (info.itens_separados > 0 || info.itens_em_falta > 0) &&
        statusAtual === "em_separacao"
      ) {
        // Se todos os itens foram processados (separados ou em falta), muda para separado
        await sql`UPDATE requisicoes SET status = 'separado' WHERE id = ${requisicao_id}`
      } else if (info.itens_entregues > 0 && statusAtual === "separado") {
        // Se começou a entregar, muda para em_entrega
        await sql`UPDATE requisicoes SET status = 'em_entrega' WHERE id = ${requisicao_id}`
      } else if (info.itens_entregues === info.total_itens && statusAtual === "em_entrega") {
        // Se todos os itens foram entregues, muda para entregue
        await sql`UPDATE requisicoes SET status = 'entregue' WHERE id = ${requisicao_id}`
      }
    } catch (error) {
      console.error("Erro ao atualizar status automático:", error)
    }
  },

  // Dashboard
  async getDashboardStats(): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          COUNT(CASE WHEN DATE(r.data_solicitacao) = CURRENT_DATE THEN 1 END) as requisicoes_hoje,
          COUNT(CASE WHEN r.status IN ('pendente', 'em_separacao') THEN 1 END) as requisicoes_pendentes,
          COUNT(CASE WHEN r.status = 'entregue' THEN 1 END) as requisicoes_concluidas
        FROM requisicoes r
        WHERE r.data_solicitacao >= CURRENT_DATE - INTERVAL '30 days'
      `
      return (
        result[0] || {
          requisicoes_hoje: 0,
          requisicoes_pendentes: 0,
          requisicoes_concluidas: 0,
        }
      )
    } catch (error) {
      console.error("Erro ao buscar stats do dashboard:", error)
      return {
        requisicoes_hoje: 0,
        requisicoes_pendentes: 0,
        requisicoes_concluidas: 0,
      }
    }
  },

  // Histórico
  async getHistoricoRequisicao(requisicao_id: number): Promise<HistoricoRequisicao[]> {
    return await sql`
      SELECT h.*, u.nome as usuario_nome
      FROM historico_requisicoes h
      JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.requisicao_id = ${requisicao_id}
      ORDER BY h.created_at DESC
    `
  },

  // Função para buscar estatísticas do dashboard
  async getEstatisticasDashboard(): Promise<{
    requisicoes_hoje: number
    requisicoes_pendentes: number
    requisicoes_concluidas: number
    consumo_medio: number
    previsao_amanha: number
  }> {
    try {
      const result = await sql`
        SELECT 
          COUNT(CASE WHEN DATE(r.data_solicitacao) = CURRENT_DATE THEN 1 END) as requisicoes_hoje,
          COUNT(CASE WHEN r.status IN ('pendente', 'em_separacao') THEN 1 END) as requisicoes_pendentes,
          COUNT(CASE WHEN r.status = 'entregue' THEN 1 END) as requisicoes_concluidas,
          COALESCE(AVG(p.consumo_medio_diario), 0) as consumo_medio,
          COALESCE(AVG(p.consumo_medio_diario) * 1.2, 0) as previsao_amanha
        FROM requisicoes r
        CROSS JOIN produtos p
        WHERE r.data_solicitacao >= CURRENT_DATE - INTERVAL '30 days'
      `

      return (
        result[0] || {
          requisicoes_hoje: 0,
          requisicoes_pendentes: 0,
          requisicoes_concluidas: 0,
          consumo_medio: 0,
          previsao_amanha: 0,
        }
      )
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      return {
        requisicoes_hoje: 0,
        requisicoes_pendentes: 0,
        requisicoes_concluidas: 0,
        consumo_medio: 0,
        previsao_amanha: 0,
      }
    }
  },
}
