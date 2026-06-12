"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STATUS_PROCESSO_LABEL } from "@/lib/constants";
import { AREAS, AREA_OPTIONS } from "@/lib/areas-config";
import type { AreaDireito } from "@/lib/areas-config";
import { salvarProcesso } from "./actions";
import type { Processo, StatusProcesso, TipoPessoa } from "@/lib/types";

type ClienteOpt = { id: string; nome: string };
type StaffOpt = { id: string; nome: string };

export function ProcessoForm({
  clientes,
  processo,
  staff = [],
  isAdmin = true,
  clienteFixoId,
}: {
  clientes: ClienteOpt[];
  processo?: Processo;
  /** advogada + associados, para atribuir o responsável (somente admin) */
  staff?: StaffOpt[];
  isAdmin?: boolean;
  /** quando aberto a partir da ficha de um cliente: já vincula a ele */
  clienteFixoId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<AreaDireito>(processo?.area ?? "TRABALHISTA");
  const [parteTipo, setParteTipo] = useState<TipoPessoa>(
    processo?.parte_contraria_tipo ?? "PJ"
  );
  const editando = Boolean(processo);
  const cfg = AREAS[area];
  const dados = processo?.dados_area ?? {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo processo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar processo" : "Novo processo"}
          </DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarProcesso(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {processo && <input type="hidden" name="id" value={processo.id} />}
          {clienteFixoId && (
            <input type="hidden" name="cliente_id" value={clienteFixoId} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Área do Direito — comanda os campos abaixo */}
            <div className="space-y-1.5">
              <Label htmlFor="area">Área do Direito *</Label>
              <Select
                name="area"
                value={area}
                onValueChange={(v) => setArea(v as AreaDireito)}
              >
                <SelectTrigger id="area">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipo_acao">Tipo de ação *</Label>
              <Select
                name="tipo_acao"
                key={area /* reseta ao trocar de área */}
                defaultValue={processo?.tipo_acao ?? cfg.tiposAcao[0]?.value}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {cfg.tiposAcao.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && !clienteFixoId && (
              <div className="space-y-1.5">
                <Label htmlFor="cliente_id">{cfg.clienteLabel} (cliente) *</Label>
                <Select
                  name="cliente_id"
                  defaultValue={processo?.cliente_id}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Select
                  name="responsavel_id"
                  defaultValue={processo?.responsavel_id ?? "__admin__"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sob o admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__admin__">
                      Sob o admin (sem associado)
                    </SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="numero_cnj">Número CNJ *</Label>
              <Input
                id="numero_cnj"
                name="numero_cnj"
                required
                defaultValue={processo?.numero_cnj}
                placeholder="0000000-00.0000.8.07.0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vara">Vara / Juízo</Label>
              <Input
                id="vara"
                name="vara"
                defaultValue={processo?.vara ?? ""}
                placeholder="3ª Vara Cível de Brasília"
              />
            </div>

            {/* Parte contrária (rótulo por área) */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="parte_contraria_nome">
                {cfg.contrariaLabel} (parte contrária)
              </Label>
              <Input
                id="parte_contraria_nome"
                name="parte_contraria_nome"
                defaultValue={processo?.parte_contraria_nome ?? ""}
                placeholder="Nome / razão social da parte contrária"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parte_contraria_tipo">Tipo da parte contrária</Label>
              <Select
                name="parte_contraria_tipo"
                value={parteTipo}
                onValueChange={(v) => setParteTipo(v as TipoPessoa)}
              >
                <SelectTrigger id="parte_contraria_tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PJ">Pessoa jurídica</SelectItem>
                  <SelectItem value="PF">Pessoa física</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parte_contraria_doc">
                {parteTipo === "PJ" ? "CNPJ" : "CPF"} da parte contrária
              </Label>
              <Input
                id="parte_contraria_doc"
                name="parte_contraria_doc"
                defaultValue={processo?.parte_contraria_doc ?? ""}
                placeholder={
                  parteTipo === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fase">Fase processual</Label>
              <Input
                id="fase"
                name="fase"
                defaultValue={processo?.fase ?? ""}
                placeholder="Conhecimento / Execução..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                defaultValue={processo?.status ?? "ATIVO"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_PROCESSO_LABEL) as StatusProcesso[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_PROCESSO_LABEL[s]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor_causa">Valor da causa (R$)</Label>
              <Input
                id="valor_causa"
                name="valor_causa"
                type="number"
                step="0.01"
                defaultValue={processo?.valor_causa ?? ""}
                placeholder="45000.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_distribuicao">Data de distribuição</Label>
              <Input
                id="data_distribuicao"
                name="data_distribuicao"
                type="date"
                defaultValue={processo?.data_distribuicao ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_audiencia">Data/hora da audiência</Label>
              <Input
                id="data_audiencia"
                name="data_audiencia"
                type="datetime-local"
                defaultValue={
                  processo?.data_audiencia
                    ? processo.data_audiencia.slice(0, 16)
                    : ""
                }
              />
            </div>

            {/* Campos específicos da área selecionada */}
            {cfg.campos.length > 0 && (
              <div className="sm:col-span-2">
                <p className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  Dados de {cfg.label.toLowerCase()}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {cfg.campos.map((campo) => {
                    const fieldName = `area_${campo.name}`;
                    const value = dados?.[campo.name] ?? "";
                    return (
                      <div
                        key={campo.name}
                        className={`space-y-1.5 ${campo.full ? "sm:col-span-2" : ""}`}
                      >
                        <Label htmlFor={fieldName}>{campo.label}</Label>
                        {campo.type === "textarea" ? (
                          <Textarea
                            id={fieldName}
                            name={fieldName}
                            rows={2}
                            defaultValue={value}
                            placeholder={campo.placeholder}
                          />
                        ) : (
                          <Input
                            id={fieldName}
                            name={fieldName}
                            type={campo.type}
                            step={campo.type === "number" ? "0.01" : undefined}
                            defaultValue={value}
                            placeholder={campo.placeholder}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pedidos">Pedidos (um por linha)</Label>
              <Textarea
                id="pedidos"
                name="pedidos"
                rows={3}
                defaultValue={processo?.pedidos?.join("\n") ?? ""}
                placeholder={"Pedido 1\nPedido 2"}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                rows={2}
                defaultValue={processo?.obs ?? ""}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
