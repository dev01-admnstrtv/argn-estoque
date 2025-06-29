"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronDown, Plus, Trash2, Package, Clock, User, MapPin } from "lucide-react"
import { createRequisicao } from "@/app/actions/requisicoes"
import { useRouter } from "next/navigation"

interface ItemRequisicao {
  id: string
  produto_id: number
  nome: string
  quantidadeAtual: number
  quantidadeSolicitada: number
  unidade: string
  categoria: string
  preco_unitario: number
}

interface NovaRequisicaoFormProps {
  produtos: any[]
  setores: any[]
}

export default function NovaRequisicaoForm({ produtos, setores }: NovaRequisicaoFormProps) {
  const [dataEntrega, setDataEntrega] = useState("")
  const [turno, setTurno] = useState("")
  const [setorId, setSetorId] = useState("")
  const [itensRequisicao, setItensRequisicao] = useState<ItemRequisicao[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState("")
  const [openCombobox, setOpenCombobox] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [observacoes, setObservacoes] = useState("")

  const router = useRouter()

  const adicionarItem = (produto: any) => {
    const novoItem: ItemRequisicao = {
      id: Date.now().toString(),
      produto_id: produto.id,
      nome: produto.nome,
      quantidadeAtual: produto.estoque_atual,
      quantidadeSolicitada: Math.ceil(produto.consumo_medio_diario || 1),
      unidade: produto.unidade,
      categoria: produto.categoria,
      preco_unitario: produto.preco_unitario || 0,
    }
    setItensRequisicao([...itensRequisicao, novoItem])
    setProdutoSelecionado("")
    setOpenCombobox(false)
  }

  const removerItem = (id: string) => {
    setItensRequisicao(itensRequisicao.filter((item) => item.id !== id))
  }

  const atualizarItem = (id: string, campo: string, valor: number) => {
    setItensRequisicao(itensRequisicao.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)))
  }

  const enviarRequisicao = async () => {
    if (!dataEntrega || !turno || !setorId || itensRequisicao.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)

    try {
      const requisicaoData = {
        setor_id: Number.parseInt(setorId),
        data_entrega_prevista: dataEntrega,
        turno,
        observacoes: observacoes || "Requisição criada via sistema",
        itens: itensRequisicao.map((item) => ({
          produto_id: item.produto_id,
          quantidade_solicitada: item.quantidadeSolicitada,
          quantidade_atual_estoque: item.quantidadeAtual,
          preco_unitario: item.preco_unitario,
        })),
      }

      await createRequisicao(requisicaoData)

      alert("Requisição enviada com sucesso!")

      // Redirecionar para a página inicial
      router.push("/")
    } catch (error) {
      console.error("Erro ao enviar requisição:", error)
      alert("Erro ao enviar requisição. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const hoje = new Date().toISOString().split("T")[0]

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Nova Requisição de Estoque</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
       
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataEntrega" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Data de Entrega</span>
            </Label>
            <Input
              id="dataEntrega"
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              min={hoje}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="turno" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Turno de Entrega</span>
            </Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Selecione o turno" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="manha">Manhã (06:00 - 12:00)</SelectItem>
                <SelectItem value="tarde">Tarde (12:00 - 18:00)</SelectItem>
                <SelectItem value="noite">Noite (18:00 - 00:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Setor de Entrega</span>
            </Label>
            <Select value={setorId} onValueChange={setSetorId}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()} className="text-white">
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Solicitante</span>
            </Label>
            <Input value="Maria Silva" disabled className="bg-white/5 border-white/20 text-white" />
          </div>
        </div>
        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes" className="flex items-center space-x-2">
            <span>Observações</span>
          </Label>
          <Input
            id="observacoes"
            type="text"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            placeholder="Digite observações adicionais (opcional)"
          />
        </div>
        {/* Adicionar Produtos */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Itens da Requisição</Label>

          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                {produtoSelecionado || "Buscar produto..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-slate-800 border-white/20">
              <Command className="bg-slate-800">
                <CommandInput placeholder="Buscar produto..." className="text-white placeholder:text-gray-400" />
                <CommandEmpty className="text-gray-400">Nenhum produto encontrado.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {produtos.map((produto) => (
                      <CommandItem
                        key={produto.id}
                        onSelect={() => adicionarItem(produto)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span>{produto.nome}</span>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Badge variant="secondary" className="text-xs">
                              {produto.categoria}
                            </Badge>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Lista de Itens */}
        {itensRequisicao.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens Selecionados</h3>
            {itensRequisicao.map((item) => (
              <Card key={item.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{item.nome}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.categoria}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">Estoque Atual ({item.unidade})</Label>
                      <Input
                        type="number"
                        value={item.quantidadeAtual}
                        onChange={(e) => atualizarItem(item.id, "quantidadeAtual", Number(e.target.value))}
                        className="bg-white/5 border-white/20 text-white"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">Quantidade Solicitada ({item.unidade})</Label>
                      <Input
                        type="number"
                        value={item.quantidadeSolicitada}
                        onChange={(e) => atualizarItem(item.id, "quantidadeSolicitada", Number(e.target.value))}
                        className="bg-white/5 border-white/20 text-white"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botão de Envio */}
        <Button
          onClick={enviarRequisicao}
          disabled={!dataEntrega || !turno || !setorId || itensRequisicao.length === 0 || isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isSubmitting ? "Enviando..." : "Enviar Requisição"}
        </Button>
      </CardContent>
    </Card>
  )
}
