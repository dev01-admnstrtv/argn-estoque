import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock, AlertCircle, Calendar, User, MapPin, ChevronRight, PackageCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { queries } from "@/lib/database"
import SeparacaoFilter from "@/components/separacao-filter"

const statusConfig = {
  pendente: { label: "Novo Pedido", color: "bg-yellow-500", icon: Clock },
  em_separacao: { label: "Em Separação", color: "bg-purple-500", icon: PackageCheck },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

interface PageProps {
  searchParams: {
    status?: string
    setor?: string
    busca?: string
  }
}

export default async function SeparacaoPage({ searchParams }: PageProps) {
  // Buscar requisições para separação (pendentes e em_separacao)
  const requisicoes = await queries.getRequisicoesParaSeparacao({
    status: searchParams.status !== "todos" ? searchParams.status : undefined,
    setor_id: searchParams.setor ? Number(searchParams.setor) : undefined,
  })

  // Buscar setores para o filtro
  const setores = await queries.getSetores()

  // Filtrar por busca se necessário
  const requisicoesFiltered = requisicoes.filter((req) => {
    if (!searchParams.busca) return true

    const busca = searchParams.busca.toLowerCase()
    return (
      req.codigo.toLowerCase().includes(busca) ||
      req.solicitante_nome.toLowerCase().includes(busca) ||
      req.setor_nome.toLowerCase().includes(busca)
    )
  })

  // Agrupar por data de entrega
  const requisicoesAgrupadas = requisicoesFiltered.reduce(
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

  // Calcular estatísticas
  const stats = {
    novos_pedidos: requisicoesFiltered.filter((r) => r.status === "pendente").length,
    em_separacao: requisicoesFiltered.filter((r) => r.status === "em_separacao").length,
    itens_pendentes: requisicoesFiltered.reduce((acc, req) => acc + Number(req.itens_pendentes || 0), 0),
    total_pedidos: requisicoesFiltered.length,
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
                <h1 className="text-xl font-bold">Separação de Produtos</h1>
                <p className="text-sm text-gray-400">Gerenciar pedidos para separação</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Estoquista</p>
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
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Novos Pedidos</p>
                  <p className="text-xl font-bold">{stats.novos_pedidos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <PackageCheck className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Em Separação</p>
                  <p className="text-xl font-bold">{stats.em_separacao}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Itens Pendentes</p>
                  <p className="text-xl font-bold">{stats.itens_pendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Total de Pedidos</p>
                  <p className="text-xl font-bold">{stats.total_pedidos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <SeparacaoFilter setores={setores} />

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
              {requisicoesAgrupadas[data].map((requisicao) => (
                <SeparacaoCard key={requisicao.id} requisicao={requisicao} />
              ))}
            </div>
          </div>
        ))}

        {requisicoesFiltered.length === 0 && (
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-8 text-center">
              <PackageCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido para separação</h3>
              <p className="text-gray-400">Todos os pedidos foram processados ou não há novos pedidos.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Componente para o card da separação
async function SeparacaoCard({ requisicao }: { requisicao: any }) {
  // Buscar itens da requisição
  const itens = await queries.getRequisicaoItens(requisicao.id)

  const StatusIcon = statusConfig[requisicao.status as keyof typeof statusConfig]?.icon || Clock
  const statusInfo = statusConfig[requisicao.status as keyof typeof statusConfig] || statusConfig.pendente

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{requisicao.codigo}</h3>
                  <Badge className={`${statusInfo.color} text-white`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
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
                <p>Solicitado: {new Date(requisicao.data_solicitacao).toLocaleDateString("pt-BR")}</p>
                <div className="flex flex-col space-y-1 mt-2">
                  {Number(requisicao.itens_pendentes) > 0 && (
                    <p className="text-yellow-400 font-semibold">{requisicao.itens_pendentes} itens pendentes</p>
                  )}
                  {Number(requisicao.itens_separados) > 0 && (
                    <p className="text-blue-400 font-semibold">{requisicao.itens_separados} itens separados</p>
                  )}
                  {Number(requisicao.itens_em_falta) > 0 && (
                    <p className="text-red-400 font-semibold">{requisicao.itens_em_falta} itens em falta</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Itens */}
            {itens.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Itens da requisição:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {itens.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{item.produto_nome}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            item.status_item === "pendente"
                              ? "bg-yellow-500"
                              : item.status_item === "separado"
                                ? "bg-blue-500"
                                : item.status_item === "em_falta"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                          }`}
                        >
                          {item.status_item === "pendente"
                            ? "Pendente"
                            : item.status_item === "separado"
                              ? "Separado"
                              : item.status_item === "em_falta"
                                ? "Em Falta"
                                : "Parcial"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Solicitado: {item.quantidade_solicitada} {item.unidade}
                      </p>
                      <p className="text-xs text-blue-400">
                        Estoque: {item.quantidade_atual_estoque} {item.unidade}
                      </p>
                      {item.quantidade_separada > 0 && (
                        <p className="text-xs text-green-400">
                          Separado: {item.quantidade_separada} {item.unidade}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {requisicao.observacoes && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-300">{requisicao.observacoes}</p>
              </div>
            )}
          </div>

          <div className="ml-4">
            <Link href={`/separacao/${requisicao.id}`}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ChevronRight className="w-4 h-4 mr-2" />
                {requisicao.status === "pendente" ? "Iniciar Separação" : "Continuar Separação"}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
