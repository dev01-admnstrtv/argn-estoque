"use server"


import { queries, sql } from "@/lib/database"
import { revalidatePath } from "next/cache"


export async function cancelarItemEntrega({ itemId }: { itemId: number }) {
  // Atualiza o item para status em_falta e zera quantidade_separada
  await queries.updateRequisicaoItem(itemId, {
    status_item: "em_falta",
    quantidade_separada: 0,
  })
  const [{ requisicao_id: requisicaoId }] = await sql`
    SELECT requisicao_id FROM requisicao_itens WHERE id = ${itemId}
  `
  const itens = await queries.getRequisicaoItens(requisicaoId)
  if (itens.every(item => item.status_item === "entregue" || item.status_item === "em_falta")) {
    await queries.updateRequisicaoStatus(requisicaoId, "entregue")
    revalidatePath("/entrega")
    revalidatePath(`/entrega/${requisicaoId}`)
  }
}

export async function editarItemEntrega({ itemId, quantidade }: { itemId: number, quantidade: number }) {
  // Atualiza a quantidade separada do item
  await queries.updateRequisicaoItem(itemId, {
    status_item: "separado",
    quantidade_separada: quantidade,
  })
}

export async function confirmarEntregaItem({ itemId, quantidade }: { itemId: number, quantidade: number }) {
  // Atualiza o item para status entregue e define quantidade entregue
  await queries.updateRequisicaoItem(itemId, {
    status_item: "entregue",
    quantidade_separada: quantidade,
    quantidade_entregue: quantidade,
  })
  const [{ requisicao_id: requisicaoId }] = await sql`
    SELECT requisicao_id FROM requisicao_itens WHERE id = ${itemId}
  `
  const itens = await queries.getRequisicaoItens(requisicaoId)
  if (itens.every(item => item.status_item === "entregue" || item.status_item === "em_falta")) {
    await queries.updateRequisicaoStatus(requisicaoId, "entregue")
    revalidatePath("/entrega")
    revalidatePath(`/entrega/${requisicaoId}`)
  }
}
