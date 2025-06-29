"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  Save,
  CheckCircle,
  AlertTriangle,
  Truck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

interface ItemRequisicao {
  id: string
  nome: string
  quantidadeSolicitada: number
  quantidadeSeparada: number
  quantidadeEntregue: number
  unidade: string
  statusItem: "separado" | "entregue" | "parcial"
  observacoes?: string
}

interface Requisicao {
  id: string
  codigo: string
  dataSolicitacao: string
  dataEntrega: string
  turno: string
  setor: string
  solicitante: string
  status: "separado" | "em_entrega" | "entregue"
  observacoes?: string
  itens: ItemRequisicao[]
}

// Dados mock - em produção viria do banco de dados
const getRequisicaoById = (id: string): Requisicao | null => {
  const requisicoes: Record<string, Requisicao> = {
    "1": {
      id: "1",
      codigo: "REQ-001",
      dataSolicitacao: "2024-01-15",
      dataEntrega: "2024-01-16",
      turno: "manha",
      setor: "Setor de Saladas",
      solicitante: "Maria Silva",
      status: "separado",
      observacoes: "Entrega urgente para o almoço",
      itens: [
        {
          id: "1",
          nome: "Alface Americana",
          quantidadeSolicitada: 3,
          quantidadeSeparada: 2.5,
          quantidadeEntregue: 0,
          unidade: "kg",
          statusItem: "separado",
        },
        {
          id: "2",
          nome: "Tomate Cereja",
          quantidadeSolicitada: 2,
          quantidadeSeparada: 1.8,
          quantidadeEntregue: 0,
          unidade: "kg",
          statusItem: "separado",
        },
      ],
    },
    "2": {
      id: "2",
      codigo: "REQ-002",
      dataSolicitacao: "2024-01-15",
      dataEntrega: "2024-01-16",
      turno: "tarde",
      setor: "Bar",
      solicitante: "João Santos",
      status: "em_entrega",
      itens: [
        {
          id: "3",
          nome: "Limão",
          quantidadeSolicitada: 5,
          quantidadeSeparada: 3,
          quantidadeEntregue: 3,
          unidade: "kg",
          statusItem: "entregue",
        },
        {
          id: "4",
          nome: "Gelo",
          quantidadeSolicitada: 10,
          quantidadeSeparada: 8,
          quantidadeEntregue: 0,
          unidade: "kg",
          statusItem: "separado",
        },
      ],
    },
  }

  return requisicoes[id] || null
}

const statusItemConfig = {
  separado: { label: "Separado", color: "bg-blue-500", icon: Package },
  entregue: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
  parcial: { label: "Parcial", color: "bg-yellow-500", icon: Clock },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

export default function DetalheEntregaPage() {
  const params = useParams()
  const requisicaoId = params.id as string

  const [requisicao, setRequisicao] = useState<Requisicao | null>(() => getRequisicaoById(requisicaoId))
  const [observacoesGerais, setObservacoesGerais] = useState(requisicao?.observacoes || "")

  if (!requisicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Requisição não encontrada</h3>
            <p className="text-gray-400 mb-4">A requisição solicitada não existe ou foi removida.</p>
            <Link href="/entrega">
              <Button>Voltar para Entregas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const atualizarItem = (itemId: string, campo: keyof ItemRequisicao, valor: any) => {
    setRequisicao((prev) => {
      if (!prev) return null
      return {
        ...prev,
        itens: prev.itens.map((item) => {
          if (item.id === itemId) {
            const itemAtualizado = { ...item, [campo]: valor }

            // Atualizar status automaticamente baseado na quantidade entregue
            if (campo === "quantidadeEntregue") {
              if (valor === 0) {
                itemAtualizado.statusItem = "separado"
              } else if (valor >= item.quantidadeSeparada) {
                itemAtualizado.statusItem = "entregue"
              } else {
                itemAtualizado.statusItem = "parcial"
              }
            }

            return itemAtualizado
          }
          return item
        }),
      }
    })
  }

  const salvarAlteracoes = () => {
    // Aqui seria feita a integração com o backend
    console.log("Salvando alterações:", requisicao)
    alert("Alterações salvas com sucesso!")
  }

  const finalizarEntrega = () => {
    // Verificar se todos os itens foram entregues
    const itensNaoEntregues = requisicao.itens.filter((item) => item.statusItem !== "entregue")
    if (itensNaoEntregues.length > 0) {
      const confirmar = confirm(
        `Ainda há ${itensNaoEntregues.length} itens não totalmente entregues. Deseja finalizar mesmo assim?`,
      )
      if (!confirmar) return
    }

    // Atualizar status da requisição para "entregue"
    setRequisicao((prev) => {
      if (!prev) return null
      return { ...prev, status: "entregue" }
    })

    // Aqui seria feita a integração com o backend
    console.log("Finalizando entrega:", requisicao)
    alert("Entrega finalizada com sucesso!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/entrega">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Image src="/logo-aragon.png" alt="Aragon Logo" width={80} height={60} className="object-contain" />
              <div>
                <h1 className="text-xl font-bold">Entrega de Produtos</h1>
                <p className="text-sm text-gray-400">{requisicao.codigo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={salvarAlteracoes}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={finalizarEntrega}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Entrega
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Informações da Requisição */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-6 h-6" />
              <span>Informações da Entrega</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Solicitante</span>
                </Label>
                <p className="font-semibold">{requisicao.solicitante}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Setor de Destino</span>
                </Label>
                <p className="font-semibold">{requisicao.setor}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Entrega</span>
                </Label>
                <p className="font-semibold">{new Date(requisicao.dataEntrega).toLocaleDateString("pt-BR")}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Turno</span>
                </Label>
                <p className="font-semibold">{turnoLabels[requisicao.turno as keyof typeof turnoLabels]}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Observações da Entrega</Label>
              <Textarea
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                placeholder="Adicione observações sobre esta entrega..."
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Itens para Entrega</h2>
          {requisicao.itens.map((item) => {
            const StatusIcon = statusItemConfig[item.statusItem].icon
            return (
              <Card key={item.id} className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{item.nome}</h3>
                      <Badge className={`${statusItemConfig[item.statusItem].color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusItemConfig[item.statusItem].label}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>
                        Solicitado: {item.quantidadeSolicitada} {item.unidade}
                      </p>
                      <p>
                        Separado: {item.quantidadeSeparada} {item.unidade}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">Quantidade Entregue ({item.unidade})</Label>
                      <Input
                        type="number"
                        value={item.quantidadeEntregue}
                        onChange={(e) => atualizarItem(item.id, "quantidadeEntregue", Number(e.target.value))}
                        className="bg-white/5 border-white/20 text-white"
                        min="0"
                        max={item.quantidadeSeparada}
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">Ações Rápidas</Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            atualizarItem(item.id, "quantidadeEntregue", item.quantidadeSeparada)
                          }}
                          className="border-green-500 text-green-400 hover:bg-green-500/10"
                        >
                          Entregar Tudo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            atualizarItem(item.id, "quantidadeEntregue", 0)
                          }}
                          className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progresso visual */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progresso da Entrega</span>
                      <span>
                        {item.quantidadeEntregue} / {item.quantidadeSeparada} {item.unidade}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((item.quantidadeEntregue / item.quantidadeSeparada) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Observações da Entrega</Label>
                    <Textarea
                      value={item.observacoes || ""}
                      onChange={(e) => atualizarItem(item.id, "observacoes", e.target.value)}
                      placeholder="Observações específicas desta entrega..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
