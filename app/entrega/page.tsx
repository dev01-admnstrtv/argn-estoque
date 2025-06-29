"use client"

import { useState } from "react"
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

// Dados mock das requisições prontas para entrega
const requisicoesData: Requisicao[] = [
  {
    id: "1",
    codigo: "REQ-001",
    dataSolicitacao: "2024-01-15",
    dataEntrega: "2024-01-16",
    turno: "manha",
    setor: "Setor de Saladas",
    solicitante: "Maria Silva",
    status: "separado",
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
    totalItens: 2,
    itensPendentes: 2,
  },
  {
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
    totalItens: 2,
    itensPendentes: 1,
  },
  {
    id: "3",
    codigo: "REQ-006",
    dataSolicitacao: "2024-01-15",
    dataEntrega: "2024-01-16",
    turno: "manha",
    setor: "Entradas",
    solicitante: "Lucia Ferreira",
    status: "separado",
    itens: [
      {
        id: "5",
        nome: "Queijo Brie",
        quantidadeSolicitada: 1,
        quantidadeSeparada: 0.8,
        quantidadeEntregue: 0,
        unidade: "kg",
        statusItem: "separado",
      },
      {
        id: "6",
        nome: "Pão Francês",
        quantidadeSolicitada: 20,
        quantidadeSeparada: 18,
        quantidadeEntregue: 0,
        unidade: "unidade",
        statusItem: "separado",
      },
    ],
    totalItens: 2,
    itensPendentes: 2,
  },
]

const statusConfig = {
  separado: { label: "Separado", color: "bg-blue-500", icon: Package },
  em_entrega: { label: "Em Entrega", color: "bg-purple-500", icon: Truck },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

export default function EntregaPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroSetor, setFiltroSetor] = useState<string>("todos")
  const [busca, setBusca] = useState("")

  // Filtrar apenas requisições separadas ou em entrega
  const requisicoesFiltered = requisicoesData
    .filter((req) => req.itensPendentes > 0) // Apenas com itens pendentes de entrega
    .filter((req) => {
      const matchStatus = filtroStatus === "todos" || req.status === filtroStatus
      const matchSetor = filtroSetor === "todos" || req.setor === filtroSetor
      const matchBusca =
        busca === "" ||
        req.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        req.solicitante.toLowerCase().includes(busca.toLowerCase()) ||
        req.setor.toLowerCase().includes(busca.toLowerCase())

      return matchStatus && matchSetor && matchBusca
    })

  // Agrupar por data de entrega
  const requisicoesAgrupadas = requisicoesFiltered.reduce(
    (acc, req) => {
      const data = req.dataEntrega
      if (!acc[data]) {
        acc[data] = []
      }
      acc[data].push(req)
      return acc
    },
    {} as Record<string, Requisicao[]>,
  )

  // Ordenar datas (mais próxima primeiro)
  const datasOrdenadas = Object.keys(requisicoesAgrupadas).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

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

  const setoresUnicos = [...new Set(requisicoesData.map((req) => req.setor))]

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
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Prontos p/ Entrega</p>
                  <p className="text-xl font-bold">
                    {requisicoesFiltered.filter((r) => r.status === "separado").length}
                  </p>
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
                  <p className="text-xl font-bold">
                    {requisicoesFiltered.filter((r) => r.status === "em_entrega").length}
                  </p>
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
                  <p className="text-xl font-bold">
                    {requisicoesFiltered.reduce((acc, req) => acc + req.itensPendentes, 0)}
                  </p>
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
                  <p className="text-xl font-bold">{requisicoesFiltered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Código, solicitante ou setor..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Status</label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="separado">Separado</SelectItem>
                    <SelectItem value="em_entrega">Em Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Setor</label>
                <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="todos">Todos os Setores</SelectItem>
                    {setoresUnicos.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {requisicoesAgrupadas[data].map((requisicao) => {
                const StatusIcon = statusConfig[requisicao.status].icon
                return (
                  <Card key={requisicao.id} className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{requisicao.codigo}</h3>
                                <Badge className={`${statusConfig[requisicao.status].color} text-white`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig[requisicao.status].label}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{requisicao.solicitante}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{requisicao.setor}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{turnoLabels[requisicao.turno as keyof typeof turnoLabels]}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-400">
                              <p>Separado: {new Date(requisicao.dataSolicitacao).toLocaleDateString("pt-BR")}</p>
                              <p className="text-orange-400 font-semibold">
                                {requisicao.itensPendentes} de {requisicao.totalItens} itens para entregar
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-300">Itens separados:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {requisicao.itens.map((item) => (
                                <div key={item.id} className="bg-white/5 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{item.nome}</p>
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        item.statusItem === "separado"
                                          ? "bg-blue-500"
                                          : item.statusItem === "entregue"
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                      }`}
                                    >
                                      {item.statusItem === "separado"
                                        ? "Separado"
                                        : item.statusItem === "entregue"
                                          ? "Entregue"
                                          : "Parcial"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    Separado: {item.quantidadeSeparada} {item.unidade}
                                  </p>
                                  {item.quantidadeEntregue > 0 && (
                                    <p className="text-xs text-green-400">
                                      Entregue: {item.quantidadeEntregue} {item.unidade}
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
              })}
            </div>
          </div>
        ))}

        {requisicoesFiltered.length === 0 && (
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
