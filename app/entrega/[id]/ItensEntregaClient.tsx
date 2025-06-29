"use client"

import { useState, useTransition } from "react"
import { cancelarItemEntrega, editarItemEntrega, confirmarEntregaItem } from "./actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const statusItemConfig = {
  separado: { label: "Separado", color: "bg-blue-500" },
  entregue: { label: "Entregue", color: "bg-green-500" },
  parcial: { label: "Parcial", color: "bg-yellow-500" },
  em_falta: { label: "Em Falta", color: "bg-red-500" },
}

export default function ItensEntregaClient({ itens }: { itens: any[] }) {
  const [editStates, setEditStates] = useState<{ [id: number]: { modo: "view"|"edit"; quantidade: number } }>(
    () => Object.fromEntries(itens.map((item) => [item.id, { modo: "view", quantidade: item.quantidade_separada }]))
  )

  function handleEditar(id: number) {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], modo: "edit" } }))
  }
  const [isPending, startTransition] = useTransition()

  function handleCancelar(id: number) {
    setEditStates((prev) => ({ ...prev, [id]: { modo: "view", quantidade: 0 } }))
    startTransition(() => cancelarItemEntrega({ itemId: id }))
  }
  function handleChangeQuantidade(id: number, value: number) {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], quantidade: value } }))
  }
  function handleConfirmar(id: number) {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], modo: "view" } }))
    const quantidade = editStates[id]?.quantidade ?? 0
    startTransition(() => editarItemEntrega({ itemId: id, quantidade }))
  }
  function handleConfirmarEntregaDireto(id: number) {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], modo: "view" } }))
    const quantidade = editStates[id]?.quantidade ?? 0
    startTransition(() => confirmarEntregaItem({ itemId: id, quantidade }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Itens para Entrega</h2>
{itens.map((item) => {
  const statusKey: keyof typeof statusItemConfig =
    item.status_item === "entregue"
      ? "entregue"
      : item.status_item === "parcial"
        ? "parcial"
        : item.status_item === "em_falta"
          ? "em_falta"
          : "separado"
  const edit = editStates[item.id]

  return (
          <Card key={item.id} className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.produto_nome}</h3>
                  <Badge className={`${statusItemConfig[statusKey].color} text-white`}>
                    {statusItemConfig[statusKey].label}
                  </Badge>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>
                    Solicitado: {item.quantidade_solicitada} {item.unidade}
                  </p>
                  <p>
                    {/* Campo de quantidade separada (editável se modo edit) */}
                    <span>Separado: </span>
                    {edit?.modo === "edit" ? (
                      <Input
                        type="number"
                        value={edit.quantidade}
                        min={0}
                        step={0.01}
                        onChange={e => handleChangeQuantidade(item.id, Number(e.target.value))}
                        className="w-24 inline-block bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <span className="font-semibold">{edit?.quantidade ?? item.quantidade_separada} {item.unidade}</span>
                    )}
                  </p>
                  <p>
                    Entregue: {item.quantidade_entregue} {item.unidade}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="destructive" onClick={() => handleCancelar(item.id)}>
                  Cancelar Item
                </Button>
                {edit?.modo === "edit" ? (
                  <Button size="sm" variant="default" onClick={() => handleConfirmar(item.id)}>
                    Confirmar Entrega
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEditar(item.id)}>
                      Editar Entrega
                    </Button>
                    <Button size="sm" variant="default" onClick={() => handleConfirmarEntregaDireto(item.id)}>
                      Confirmar Entrega
                    </Button>
                  </>
                )}
              </div>

              {/* Progresso visual */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progresso da Entrega</span>
                  <span>
                    {item.quantidade_entregue} / {edit?.quantidade ?? item.quantidade_separada} {item.unidade}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((item.quantidade_entregue / ((edit?.quantidade ?? item.quantidade_separada) || 1)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {item.observacoes && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Observações do Item</Label>
                  <div className="bg-white/5 border-white/20 text-white rounded p-2 min-h-[32px]">
                    {item.observacoes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
