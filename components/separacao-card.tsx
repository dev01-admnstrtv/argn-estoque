"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, User, MapPin } from "lucide-react"
import Link from "next/link"
import { updateRequisicaoStatus } from "@/app/actions/requisicoes"

const statusConfig = {
  pendente: { label: "Novo Pedido", color: "bg-yellow-500", icon: Clock },
  em_separacao: { label: "Em Separação", color: "bg-purple-500", icon: Clock },
}

const turnoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

export function SeparacaoCard({ requisicao, itens }: { requisicao: any; itens: any[] }) {
  const [isSending, setIsSending] = useState(false)

  const StatusIcon = statusConfig[requisicao.status as keyof typeof statusConfig]?.icon || Clock
  const statusInfo = statusConfig[requisicao.status as keyof typeof statusConfig] || statusConfig.pendente

  async function handlePassarParaEntrega() {
    setIsSending(true)
    try {
      await updateRequisicaoStatus(requisicao.id, "em_entrega")
      alert("Pedido enviado para entrega!")
      window.location.reload()
    } catch (error) {
      alert("Erro ao atualizar status do pedido.")
    } finally {
      setIsSending(false)
    }
  }

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
            {/* Botão Enviar para Entrega, só aparece se status for em_separacao */}
            {requisicao.status === "em_separacao" && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handlePassarParaEntrega}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isSending}
                >
                  {isSending ? "Enviando..." : "Enviar para Entrega"}
                </Button>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-4 flex md:block">
            <Link href={`/separacao/${requisicao.id}`} className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
