import { Card, CardContent } from "@/components/ui/card"
import { Clock, TrendingUp, BarChart3 } from "lucide-react"
import Image from "next/image"
import { queries } from "@/lib/database"
import NovaRequisicaoForm from "@/components/nova-requisicao-form"

export default async function RequisicaoEstoque() {
  // Buscar dados reais do banco
  const produtos = await queries.getProdutos()
  const setores = await queries.getSetores()
  const stats = await queries.getEstatisticasDashboard()

  // Converter strings para números e garantir valores padrão
  const consumoMedio = Number(stats.consumo_medio) || 0
  const previsaoAmanha = Number(stats.previsao_amanha) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/logo-aragon.png" alt="Aragon Logo" width={60} height={40} className="object-contain" />
              <div>
                <h1 className="text-xl font-bold">Aragon</h1>
                <p className="text-sm text-gray-400">Sistema de Requisições</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Bem-vindo,</p>
              <p className="font-semibold">Maria Silva</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de Insights */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Consumo Médio Diário</p>
                  <p className="text-xl font-bold">{consumoMedio.toFixed(1)} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Última Requisição</p>
                  <p className="text-xl font-bold">Ontem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Previsão p/ Amanhã</p>
                  <p className="text-xl font-bold">{previsaoAmanha.toFixed(1)} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>*/}

        {/* Formulário Principal */}
        <NovaRequisicaoForm produtos={produtos} setores={setores} />
      </div>
    </div>
  )
}
