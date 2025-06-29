

// import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Package, Search, Filter, Clock, Calendar, User, MapPin, ChevronRight, Truck, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Requisicao {
  id: string
  codigo: string
  dataSolicitacao: string
  dataEntrega: string
  turno: string
  setor: string
  solicitante: string
  status: "separado" | "em_entrega"
  itens: {
    id: string
    nome: string
    quantidadeSolicitada: number
    quantidadeSeparada: number
    quantidadeEntregue: number
    unidade: string
    statusItem: "separado" | "entregue" | "parcial"
  }[]
  totalItens: number
  itensPendentes: number
}



const statusConfig = {
  separado: { label: "Separado", color: "bg-blue-500", icon: Package },
  em_entrega: { label: "Em Entrega", color: "bg-purple-500", icon: Truck },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

import { queries } from "@/lib/database"

export default async function EntregaPage() {
  // Buscar requisições com status "em_entrega"
  const requisicoes = await queries.getRequisicoesParaEntrega({ status: "em_entrega" })
  // Buscar setores únicos para filtro
  const setoresUnicos = [...new Set(requisicoes.map((req) => req.setor_nome))]

  // Agrupar por data de entrega
  const requisicoesAgrupadas = requisicoes.reduce(
    (acc, req) => {
      const data = new Date(req.data_entrega_prevista).toISOString().split("T")[0]
      if (!acc[data]) {
        acc[data] = []
      }
      acc[data].push(req)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Ordenar datas (mais próxima primeiro)
  const datasOrdenadas = Object.keys(requisicoesAgrupadas).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Montar os cards agrupados por data
  const cardsByData: Record<string, JSX.Element[]> = {}
  for (const data of datasOrdenadas) {
    cardsByData[data] = []
    for (const requisicao of requisicoesAgrupadas[data]) {
      const itens = await queries.getRequisicaoItens(requisicao.id)
      const StatusIcon = statusConfig[requisicao.status as keyof typeof statusConfig].icon
      cardsByData[data].push(
        <Card key={requisicao.id} className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{requisicao.codigo}</h3>
                      <Badge className={`${statusConfig[requisicao.status as keyof typeof statusConfig].color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[requisicao.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{requisicao.solicitante_nome}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{requisicao.setor_nome}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{turnoLabels[requisicao.turno as keyof typeof turnoLabels]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>Separado: {new Date(requisicao.data_solicitacao).toLocaleDateString("pt-BR")}</p>
                    <p className="text-orange-400 font-semibold">
                      {requisicao.itens_pendentes_entrega} de {requisicao.total_itens} itens para entregar
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-300">Itens separados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {itens.map((item: any) => (
                      <div key={item.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{item.produto_nome}</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              item.status_item === "separado"
                                ? "bg-blue-500"
                                : item.status_item === "entregue"
                                  ? "bg-green-500"
                                  : item.status_item === "parcial"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                            }`}
                          >
                            {item.status_item === "separado"
                              ? "Separado"
                              : item.status_item === "entregue"
                                ? "Entregue"
                                : item.status_item === "parcial"
                                  ? "Parcial"
                                  : "Outro"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Separado: {item.quantidade_separada} {item.unidade}
                        </p>
                        {item.quantidade_entregue > 0 && (
                          <p className="text-xs text-green-400">
                            Entregue: {item.quantidade_entregue} {item.unidade}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <Link href={`/entrega/${requisicao.id}`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Entregar
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  const formatarData = (data: string) => {
    const hoje = new Date()
    const dataEntrega = new Date(data)
    const amanha = new Date(hoje)
    amanha.setDate(hoje.getDate() + 1)

    if (dataEntrega.toDateString() === hoje.toDateString()) {
      return "Hoje"
    } else if (dataEntrega.toDateString() === amanha.toDateString()) {
      return "Amanhã"
    } else {
      return dataEntrega.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/logo-aragon.png" alt="Aragon Logo" width={80} height={60} className="object-contain" />
              <div>
                <h1 className="text-xl font-bold">Entrega de Produtos</h1>
                <p className="text-sm text-gray-400">Gerenciar entregas dos pedidos separados</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Entregador</p>
              <p className="font-semibold">Sistema Aragon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas (baseadas em requisicoes) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Prontos p/ Entrega</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Em Entrega</p>
                  <p className="text-xl font-bold">{requisicoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Itens Pendentes</p>
                  <p className="text-xl font-bold">{requisicoes.reduce((acc, req) => acc + (req.itens_pendentes_entrega || 0), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Total de Pedidos</p>
                  <p className="text-xl font-bold">{requisicoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros removidos: lógica client-side não suportada em Server Component */}

        {/* Lista de Requisições Agrupadas por Data de Entrega */}
        {datasOrdenadas.map((data) => (
          <div key={data} className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Entrega: {formatarData(data)}</span>
              <Badge variant="secondary" className="ml-2">
                {requisicoesAgrupadas[data].length} pedidos
              </Badge>
            </div>

            <div className="grid gap-4">
              {cardsByData[data]}
            </div>
          </div>
        ))}

        {requisicoes.length === 0 && (
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-8 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido para entrega</h3>
              <p className="text-gray-400">Todos os pedidos foram entregues ou não há itens separados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
