import { Card, CardContent } from "@/components/ui/card"
import { Plus, List, Clock, TrendingUp, BarChart3, Package, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { queries } from "@/lib/database"

export default async function HomePage() {
  // Buscar dados reais do banco
  const stats = await queries.getEstatisticasDashboard()

  // Converter strings para números e garantir valores padrão
  const requisicoesHoje = Number(stats.requisicoes_hoje) || 0
  const requisicoesPendentes = Number(stats.requisicoes_pendentes) || 0
  const requisicoesConcluidas = Number(stats.requisicoes_concluidas) || 0

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Requisições Hoje</p>
                  <p className="text-xl font-bold">{requisicoesHoje}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Pendentes</p>
                  <p className="text-xl font-bold">{requisicoesPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Concluídas</p>
                  <p className="text-xl font-bold">{requisicoesConcluidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link href="/nova">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/5 transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">Nova Requisição</h2>
                <p className="text-sm text-gray-400">Criar uma nova solicitação de estoque</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/requisicoes">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/5 transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <List className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">Minhas Requisições</h2>
                <p className="text-sm text-gray-400">Visualizar e acompanhar requisições</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/separacao">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/5 transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">Separação</h2>
                <p className="text-sm text-gray-400">Gerenciar separação de produtos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/entrega">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/5 transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">Entrega</h2>
                <p className="text-sm text-gray-400">Confirmar entregas de produtos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
