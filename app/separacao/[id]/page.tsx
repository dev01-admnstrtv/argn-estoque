import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft, Clock, User, MapPin, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { queries } from "@/lib/database"
import SeparacaoItemForm from "@/components/separacao-item-form"

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

export default async function DetalheSeparacaoPage({ params }: PageProps) {
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
            <Link href="/separacao">
              <Button>Voltar para Separação</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/separacao">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Image src="/logo-aragon.png" alt="Aragon Logo" width={80} height={60} className="object-contain" />
              <div>
                <h1 className="text-xl font-bold">Separação de Produtos</h1>
                <p className="text-sm text-gray-400">{requisicao.codigo}</p>
              </div>
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
          <h2 className="text-xl font-bold">Itens para Separação</h2>
          {itens.map((item) => (
            <SeparacaoItemForm key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
