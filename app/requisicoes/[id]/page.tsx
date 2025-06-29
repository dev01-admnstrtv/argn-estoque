import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft, Clock, User, MapPin, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { queries } from "@/lib/database"

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  aprovada: { label: "Aprovada", color: "bg-blue-500", icon: CheckCircle },
  em_separacao: { label: "Em Separação", color: "bg-purple-500", icon: AlertTriangle },
  separado: { label: "Separado", color: "bg-indigo-500", icon: CheckCircle },
  em_entrega: { label: "Em Entrega", color: "bg-orange-500", icon: AlertTriangle },
  entregue: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-red-500", icon: XCircle },
}

const statusItemConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  separado: { label: "Separado", color: "bg-blue-500", icon: Package },
  entregue: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
  parcial: { label: "Parcial", color: "bg-orange-500", icon: AlertTriangle },
  em_falta: { label: "Em Falta", color: "bg-red-500", icon: XCircle },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function DetalheRequisicaoPage({ params }: PageProps) {
  const requisicaoId = Number.parseInt(params.id)

  // Buscar dados da requisição
  const requisicao = await queries.getRequisicaoById(requisicaoId)
  const itens = await queries.getRequisicaoItens(requisicaoId)

  if (!requisicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Requisição não encontrada</h3>
            <p className="text-gray-400 mb-4">A requisição solicitada não existe ou foi removida.</p>
            <Link href="/requisicoes">
              <Button>Voltar para Requisições</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = statusConfig[requisicao.status as keyof typeof statusConfig]?.icon || Clock
  const statusInfo = statusConfig[requisicao.status as keyof typeof statusConfig] || statusConfig.pendente

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/requisicoes">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Image src="/logo-aragon.png" alt="Aragon Logo" width={80} height={60} className="object-contain" />
              <div>
                <h1 className="text-xl font-bold">Detalhes da Requisição</h1>
                <p className="text-sm text-gray-400">{requisicao.codigo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${statusInfo.color} text-white text-lg px-3 py-1`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Informações da Requisição */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-6 h-6" />
              <span>Informações da Requisição</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400 flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Solicitante</span>
                </label>
                <p className="font-semibold">{requisicao.solicitante_nome}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Setor</span>
                </label>
                <p className="font-semibold">{requisicao.setor_nome}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Entrega</span>
                </label>
                <p className="font-semibold">
                  {new Date(requisicao.data_entrega_prevista).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Turno</span>
                </label>
                <p className="font-semibold">{turnoLabels[requisicao.turno as keyof typeof turnoLabels]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Data de Solicitação</label>
                <p className="font-semibold">
                  {new Date(requisicao.data_solicitacao).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(requisicao.data_solicitacao).toLocaleTimeString("pt-BR")}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400">Total de Itens</label>
                <p className="font-semibold">{itens.length} itens</p>
              </div>
            </div>

            {requisicao.observacoes && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Observações</label>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-300">{requisicao.observacoes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Itens da Requisição</h2>
          {itens.map((item) => {
            const StatusItemIcon = statusItemConfig[item.status_item as keyof typeof statusItemConfig]?.icon || Clock
            const statusItemInfo =
              statusItemConfig[item.status_item as keyof typeof statusItemConfig] || statusItemConfig.pendente

            return (
              <Card key={item.id} className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{item.produto_nome}</h3>
                      <Badge className={`${statusItemInfo.color} text-white`}>
                        <StatusItemIcon className="w-3 h-3 mr-1" />
                        {statusItemInfo.label}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>Preço unitário: R$ {Number(item.preco_unitario || 0).toFixed(2)}</p>
                      <p>
                        Total: R$ {(Number(item.preco_unitario || 0) * Number(item.quantidade_solicitada)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Quantidade Solicitada</label>
                      <p className="font-semibold">
                        {item.quantidade_solicitada} {item.unidade}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Estoque na Solicitação</label>
                      <p className="font-semibold">
                        {item.quantidade_atual_estoque} {item.unidade}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Quantidade Separada</label>
                      <p className="font-semibold text-blue-400">
                        {item.quantidade_separada} {item.unidade}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Quantidade Entregue</label>
                      <p className="font-semibold text-green-400">
                        {item.quantidade_entregue} {item.unidade}
                      </p>
                    </div>
                  </div>

                  {/* Progresso visual */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progresso</span>
                      <span>
                        {item.quantidade_entregue} / {item.quantidade_solicitada} {item.unidade}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((Number(item.quantidade_entregue) / Number(item.quantidade_solicitada)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {item.observacoes && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Observações do Item</label>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-300">{item.observacoes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
