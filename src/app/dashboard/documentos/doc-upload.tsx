"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_BYTES = 10 * 1024 * 1024;

type Opt = { id: string; nome: string };

export function DashboardDocUpload({
  clientes,
  processos,
}: {
  clientes: Opt[];
  processos: { id: string; nome: string; cliente_id: string }[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [clienteId, setClienteId] = useState<string>("");
  const [processoId, setProcessoId] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const processosDoCliente = processos.filter(
    (p) => p.cliente_id === clienteId
  );

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    if (!clienteId) {
      setErro("Selecione o cliente antes de enviar.");
      return;
    }
    if (file.type !== "application/pdf") {
      setErro("Apenas PDF é aceito.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErro("Arquivo acima de 10MB.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${clienteId}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("documentos")
      .upload(path, file, { contentType: "application/pdf" });
    if (upErr) {
      setErro("Falha no upload.");
      setEnviando(false);
      return;
    }

    await supabase.from("documentos").insert({
      cliente_id: clienteId,
      processo_id: processoId || null,
      uploader_id: (await supabase.auth.getUser()).data.user?.id,
      nome: file.name,
      storage_path: path,
      tipo: "PDF",
      tamanho: file.size,
    });

    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <Select value={clienteId} onValueChange={setClienteId}>
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          {clientes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={processoId}
        onValueChange={setProcessoId}
        disabled={!clienteId}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Processo (opcional)" />
        </SelectTrigger>
        <SelectContent>
          {processosDoCliente.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onChange}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={enviando || !clienteId}
        variant="outline"
      >
        <Upload className="h-4 w-4" />
        {enviando ? "Enviando..." : "Enviar PDF"}
      </Button>

      {erro && (
        <p className="flex items-center gap-1 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {erro}
        </p>
      )}
    </div>
  );
}
