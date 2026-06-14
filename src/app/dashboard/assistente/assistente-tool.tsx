"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { assistenteIA } from "./actions";

const TIPOS = [
  { value: "resumir", label: "Resumir (intimação, despacho, texto)" },
  { value: "melhorar", label: "Melhorar / revisar um texto" },
  { value: "redigir", label: "Redigir a partir de instruções" },
];

export function AssistenteTool() {
  const [tipo, setTipo] = useState("resumir");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function gerar() {
    setErro(null);
    setResultado("");
    setCarregando(true);
    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("texto", texto);
    const r = await assistenteIA(fd);
    setCarregando(false);
    if (r.erro) setErro(r.erro);
    else setResultado(r.texto ?? "");
  }

  function copiar() {
    navigator.clipboard.writeText(resultado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>O que fazer</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="texto">
              {tipo === "redigir" ? "Instruções" : "Texto"}
            </Label>
            <Textarea
              id="texto"
              rows={12}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={
                tipo === "redigir"
                  ? "Ex.: redija uma notificação extrajudicial cobrando honorários em atraso..."
                  : "Cole aqui a intimação, o despacho ou o texto a tratar..."
              }
            />
          </div>
          <Button onClick={gerar} disabled={carregando || !texto.trim()}>
            <Sparkles className="h-4 w-4" />
            {carregando ? "Gerando..." : "Gerar com IA"}
          </Button>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Label>Resultado</Label>
            {resultado && (
              <Button variant="outline" size="sm" onClick={copiar}>
                {copiado ? (
                  <>
                    <Check className="h-4 w-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="min-h-[18rem] whitespace-pre-wrap rounded-md border border-brand-border bg-brand-bg p-4 text-sm">
            {resultado || (
              <span className="text-brand-muted">
                O texto gerado aparecerá aqui. Sempre revise antes de usar.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
