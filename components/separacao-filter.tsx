"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SeparacaoFilterProps {
  setores: any[]
}

export default function SeparacaoFilter({ setores }: SeparacaoFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filtroStatus, setFiltroStatus] = useState(searchParams.get("status") || "todos")
  const [filtroSetor, setFiltroSetor] = useState(searchParams.get("setor") || "todos")
  const [busca, setBusca] = useState(searchParams.get("busca") || "")

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "todos") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/separacao?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    setFiltroStatus(value)
    updateFilters({ status: value, setor: filtroSetor, busca })
  }

  const handleSetorChange = (value: string) => {
    setFiltroSetor(value)
    updateFilters({ status: filtroStatus, setor: value, busca })
  }

  const handleBuscaChange = (value: string) => {
    setBusca(value)
    updateFilters({ status: filtroStatus, setor: filtroSetor, busca: value })
  }

  return (
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
                onChange={(e) => handleBuscaChange(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <Select value={filtroStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Novos Pedidos</SelectItem>
                <SelectItem value="em_separacao">Em Separação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Setor</label>
            <Select value={filtroSetor} onValueChange={handleSetorChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="todos">Todos os Setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
