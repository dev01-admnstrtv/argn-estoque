import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { queries } from "@/lib/database"
import RequisicoesFilter from "@/components/requisicoes-filter"

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  aprovada: { label: "Aprovada", color: "bg-blue-500", icon: CheckCircle },
  em_separacao: { label: "Em Separação", color: "bg-purple-500", icon: AlertCircle },
  separado: { label: "Separado", color: "bg-indigo-500", icon: CheckCircle },
  em_entrega: { label: "Em Entrega", color: "bg-orange-500", icon: AlertCircle },
  entregue: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-red-500", icon: XCircle },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

interface Requisicao {
  id: number
  codigo: string
  solicitante_nome: string
  setor_nome: string
  data_solicitacao: string
  status: string
  turno: string
  setor_id: number
  data_entrega_prevista: string
  total_itens: number
  observacoes?: string
}

interface PageProps {
  searchParams: {
    status?: string | undefined
    setor?: string | undefined
    busca?: string | undefined
  }
}

export default async function RequisicoesPage({ searchParams = { status: undefined, setor: undefined, busca: undefined } }: PageProps) {
  // Buscar requisições do banco
  const requisicoes = await queries.getRequisicoes({
    status: searchParams?.status !== "todos" ? searchParams?.status : undefined,
  })

  // Buscar setores para o filtro
  const setores = await queries.getSetores()

  // Filtrar por busca se necessário
  const requisicoesFiltered = requisicoes.filter((req) => {
    if (!searchParams?.busca) return true

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
    {} as Record<string, Requisicao[]>,
  )

  // Ordenar datas (mais recente primeiro)
  const datasOrdenadas = Object.keys(requisicoesAgrupadas).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <button className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              </Link>
              <div className="flex items-center space-x-3">
                <Image src="/logo-aragon.png" alt="Aragon Logo" width={60} height={40} className="object-contain" />
                <div>
                  <h1 className="text-xl font-bold">Requisições</h1>
                  <p className="text-sm text-gray-400">Acompanhe todas as solicitações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros */}
        <RequisicoesFilter setores={setores} />

        {/* Lista de Requisições Agrupadas com Accordion */}
        <Accordion type="multiple" className="w-full">
          {datasOrdenadas.map((data) => (
            <AccordionItem key={data} value={data} className="border-b border-white/10">
              <AccordionTrigger className="flex items-center space-x-2 text-lg font-semibold bg-black/10 px-4 py-3 rounded-t">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>{formatarData(data)}</span>
                <Badge variant="secondary" className="ml-2">
                  {requisicoesAgrupadas[data].length} requisições
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="grid gap-4 px-2 pb-4">
                {requisicoesAgrupadas[data].map((requisicao: Requisicao) => (
                  <RequisicaoCard key={requisicao.id} requisicao={requisicao as RequisicaoCardProps['requisicao']} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {requisicoesFiltered.length === 0 && (
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma requisição encontrada</h3>
              <p className="text-gray-400">Tente ajustar os filtros ou criar uma nova requisição.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Tipo para as props do card da requisição
type RequisicaoCardProps = {
  requisicao: Requisicao
}

// Componente para o card da requisição
async function RequisicaoCard({ requisicao }: RequisicaoCardProps) {
  // Buscar itens da requisição
  const itens = await queries.getRequisicaoItens(requisicao.id)

  const StatusIcon = statusConfig[requisicao.status as keyof typeof statusConfig]?.icon || Clock
  const statusInfo = statusConfig[requisicao.status as keyof typeof statusConfig] || statusConfig.pendente

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
                <p>Entrega: {new Date(requisicao.data_entrega_prevista).toLocaleDateString("pt-BR")}</p>
                <p>
                  {requisicao.total_itens} {requisicao.total_itens === 1 ? "item" : "itens"}
                </p>
              </div>
            </div>

            {/* Lista de Itens */}
            {itens.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Itens solicitados:</h4>
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
                                : item.status_item === "entregue"
                                  ? "bg-green-500"
                                  : item.status_item === "em_falta"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                          }`}
                        >
                          {item.status_item === "pendente"
                            ? "Pendente"
                            : item.status_item === "separado"
                              ? "Separado"
                              : item.status_item === "entregue"
                                ? "Entregue"
                                : item.status_item === "em_falta"
                                  ? "Em Falta"
                                  : "Parcial"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Solicitado: {item.quantidade_solicitada} {item.unidade}
                      </p>
                      {item.quantidade_separada > 0 && (
                        <p className="text-xs text-blue-400">
                          Separado: {item.quantidade_separada} {item.unidade}
                        </p>
                      )}
                      {item.quantidade_entregue > 0 && (
                        <p className="text-xs text-green-400">
                          Entregue: {item.quantidade_entregue} {item.unidade}
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

          <div className="mt-4 md:mt-0 md:ml-4 flex md:block justify-end">
            <Link href={`/requisicoes/${requisicao.id}`} className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ChevronRight className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
