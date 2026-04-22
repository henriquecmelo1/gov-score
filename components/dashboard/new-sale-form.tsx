"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction } from "@/actions/sales";
import { useState } from "react";

export function NewSaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: { status: "pendente" },
  });

  const onSubmit = async (data: SaleInput) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("entidade_devedora", data.entidade_devedora);
    formData.append("valor_nf", data.valor_nf);
    formData.append("data_entrega", data.data_entrega);
    formData.append("numero_ordem", data.numero_ordem);
    formData.append("itens_quantidade", data.itens_quantidade);

    const nfFile = data.nf_file?.[0];
    const contratoFile = data.contrato_file?.[0];
    if (nfFile) formData.append("nf_file", nfFile);
    if (contratoFile) formData.append("contrato_file", contratoFile);

    const result = await createSaleAction(formData);
    
    if (result.success) {
      alert("Venda cadastrada com sucesso!");
      reset();
      onSuccess(); // Fecha o modal ou limpa a tela
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entidade Devedora</label>
          <input {...register("entidade_devedora")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" placeholder="Ex: Prefeitura de Recife" />
          {errors.entidade_devedora && <p className="text-red-500 text-xs">{errors.entidade_devedora.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor da NF (R$)</label>
          <input {...register("valor_nf")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" placeholder="0.00" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número da Ordem</label>
          <input {...register("numero_ordem")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Entrega</label>
          <input type="date" {...register("data_entrega")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Itens e Quantidades</label>
        <textarea {...register("itens_quantidade")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" rows={3} placeholder="Descreva os produtos/serviços..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nota Fiscal (PDF)</label>
          <input type="file" {...register("nf_file")} className="w-full text-gray-900" accept=".pdf" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contrato (PDF)</label>
          <input type="file" {...register("contrato_file")} className="w-full text-gray-900" accept=".pdf" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? "Salvando..." : "Cadastrar Venda"}
      </button>
    </form>
  );
}