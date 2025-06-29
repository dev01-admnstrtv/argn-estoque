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
  CheckCircle,
  AlertTriangle,
  Truck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"


import ItensEntregaClient from "./ItensEntregaClient"
import { queries } from "@/lib/database"

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

interface DetalheEntregaPageProps {
  params: { id: string }
}

export default async function Page({ params }: DetalheEntregaPageProps) {
  // Server Component: busca dados
  const requisicaoId = Number(params.id)
  const requisicao = await queries.getRequisicaoById(requisicaoId)
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
  const itensDB = await queries.getRequisicaoItens(requisicaoId)

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
            {/* Botões de ação removidos: persistência não implementada neste fluxo server-side */}
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
                <p className="font-semibold">{requisicao.solicitante_nome}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Setor de Destino</span>
                </Label>
                <p className="font-semibold">{requisicao.setor_nome}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Entrega</span>
                </Label>
                <p className="font-semibold">{new Date(requisicao.data_entrega_prevista).toLocaleDateString("pt-BR")}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Turno</span>
                </Label>
                <p className="font-semibold">{turnoLabels[requisicao.turno as keyof typeof turnoLabels]}</p>
              </div>
            </div>

            {requisicao.observacoes && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Observações da Entrega</Label>
                <div className="bg-white/5 border-white/20 text-white rounded p-2 min-h-[40px]">
                  {requisicao.observacoes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        {/* Itens para entrega com controles de edição/ação */}
        <ItensEntregaClient itens={itensDB} />
      </div>
    </div>
  )
}
