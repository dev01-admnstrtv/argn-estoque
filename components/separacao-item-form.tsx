"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, PackageCheck, XCircle, Save } from "lucide-react"
import { updateRequisicaoItem } from "@/app/actions/requisicoes"

const statusItemConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  separado: { label: "Separado", color: "bg-blue-500", icon: PackageCheck },
  em_falta: { label: "Em Falta", color: "bg-red-500", icon: XCircle },
}

interface SeparacaoItemFormProps {
  item: any
}

export default function SeparacaoItemForm({ item }: SeparacaoItemFormProps) {
  const [quantidadeSeparada, setQuantidadeSeparada] = useState(Number(item.quantidade_separada) || 0)
  const [statusItem, setStatusItem] = useState(item.status_item || "pendente")
  const [observacoes, setObservacoes] = useState(item.observacoes || "")
  const [isSaving, setIsSaving] = useState(false)

  const StatusIcon = statusItemConfig[statusItem as keyof typeof statusItemConfig]?.icon || Clock

  const salvarItem = async () => {
    setIsSaving(true)

    try {
      await updateRequisicaoItem(item.id, {
        quantidade_separada: quantidadeSeparada,
        status_item: statusItem,
        observacoes: observacoes || null,
        requisicao_id: item.requisicao_id, // Adicionar para atualização automática de status
      })

      alert("Item atualizado com sucesso!")
      // Recarregar a página para mostrar mudanças
      window.location.reload()
    } catch (error) {
      console.error("Erro ao salvar item:", error)
      alert("Erro ao salvar item. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const separarTudo = () => {
    setQuantidadeSeparada(Number(item.quantidade_solicitada))
    setStatusItem("separado")
  }

  const marcarEmFalta = () => {
    setQuantidadeSeparada(0)
    setStatusItem("em_falta")
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{item.produto_nome}</h3>
            <Badge
              className={`${statusItemConfig[statusItem as keyof typeof statusItemConfig]?.color || "bg-gray-500"} text-white`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusItemConfig[statusItem as keyof typeof statusItemConfig]?.label || "Desconhecido"}
            </Badge>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>
              Solicitado: {item.quantidade_solicitada} {item.unidade}
            </p>
            <p>
              Estoque Atual: {item.quantidade_atual_estoque} {item.unidade}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Quantidade Separada ({item.unidade})</Label>
            <Input
              type="number"
              value={quantidadeSeparada}
              onChange={(e) => setQuantidadeSeparada(Number(e.target.value))}
              className="bg-white/5 border-white/20 text-white"
              min="0"
              max={Number(item.quantidade_solicitada)}
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Status do Item</Label>
            <Select value={statusItem} onValueChange={setStatusItem}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="separado">Separado</SelectItem>
                <SelectItem value="em_falta">Em Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Ações Rápidas</Label>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={separarTudo}
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 bg-transparent"
              >
                Separar Tudo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={marcarEmFalta}
                className="border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                Em Falta
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label className="text-sm text-gray-400">Observações do Item</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações específicas deste item..."
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            rows={2}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={salvarItem}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Item"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
