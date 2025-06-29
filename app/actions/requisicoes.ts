"use server"

import { queries } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function createRequisicao(data: {
  setor_id: number
  data_entrega_prevista: string
  turno: string
  observacoes?: string
  itens: {
    produto_id: number
    quantidade_solicitada: number
    quantidade_atual_estoque: number
    preco_unitario: number
  }[]
}) {
  try {
    // Criar a requisição
    const requisicao = await queries.createRequisicao({
      solicitante_id: 1, // ID fixo para Maria Silva por enquanto
      setor_id: data.setor_id,
      data_entrega_prevista: data.data_entrega_prevista,
      turno: data.turno,
      observacoes: data.observacoes,
    })

    // Criar os itens da requisição
    for (const item of data.itens) {
      await queries.createRequisicaoItem({
        requisicao_id: requisicao.id,
        produto_id: item.produto_id,
        quantidade_solicitada: item.quantidade_solicitada,
        quantidade_atual_estoque: item.quantidade_atual_estoque,
        preco_unitario: item.preco_unitario,
      })
    }

    // Revalidar as páginas que mostram requisições
    revalidatePath("/")
    revalidatePath("/requisicoes")
    revalidatePath("/separacao")

    return { success: true, requisicao }
  } catch (error) {
    console.error("Erro ao criar requisição:", error)
    throw new Error("Falha ao criar requisição")
  }
}

export async function updateRequisicaoStatus(id: number, status: string, usuario_id?: number) {
  try {
    await queries.updateRequisicaoStatus(id, status, usuario_id)

    // Revalidar páginas relevantes
    revalidatePath("/requisicoes")
    revalidatePath("/separacao")
    revalidatePath("/entrega")

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    throw new Error("Falha ao atualizar status da requisição")
  }
}

export async function updateRequisicaoItem(id: number, updates: any) {
  try {
    await queries.updateRequisicaoItem(id, updates)

    // Revalidar páginas relevantes
    revalidatePath("/separacao")
    revalidatePath("/entrega")

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar item:", error)
    throw new Error("Falha ao atualizar item da requisição")
  }
}
