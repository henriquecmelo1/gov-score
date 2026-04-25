"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import type { Sale } from "@/lib/schemas/sales";

type SaleFormProps = {
  onSuccess: () => void;
  sale?: Sale | null;
};

function getDefaultValues(sale?: Sale | null): SaleInput {
  return {
    entidade_devedora: sale?.entidade_devedora ?? "",
    valor_nf: sale ? String(sale.valor_nf) : "",
    data_entrega: sale ? sale.data_entrega.slice(0, 10) : "",
    numero_ordem: sale?.numero_ordem ?? "",
    itens_quantidade: sale?.itens_quantidade ?? "",
    status: sale?.status === "Pago" ? "pago" : "pendente",
    nf_file: undefined,
    contrato_file: undefined,
  };
}

export function NewSaleForm({ onSuccess, sale }: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(sale);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: getDefaultValues(sale),
  });

  useEffect(() => {
    reset(getDefaultValues(sale));
  }, [sale, reset]);

  const onSubmit = async (data: SaleInput) => {
    setLoading(true);
    const formData = new FormData();
    if (sale) {
      formData.append("sale_id", sale.id);
    }
    formData.append("entidade_devedora", data.entidade_devedora);
    formData.append("valor_nf", data.valor_nf);
    formData.append("data_entrega", data.data_entrega);
    formData.append("numero_ordem", data.numero_ordem);
    formData.append("itens_quantidade", data.itens_quantidade);

    const nfFile = data.nf_file?.[0];
    const contratoFile = data.contrato_file?.[0];
    if (nfFile) formData.append("nf_file", nfFile);
    if (contratoFile) formData.append("contrato_file", contratoFile);

    const result = sale ? await updateSaleAction(formData) : await createSaleAction(formData);
    
    if (result.success) {
      alert(sale ? "Venda atualizada com sucesso!" : "Venda cadastrada com sucesso!");
      reset(getDefaultValues(null));
      onSuccess(); // Fecha o modal ou limpa a tela
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar Venda" : "Cadastrar Nova Venda"}
          </h3>
          {isEditing && (
            <p className="mt-1 text-sm text-gray-600">
              Você pode alterar os dados abaixo e substituir os arquivos se necessário.
            </p>
          )}
        </div>
      </div>

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
          {sale?.nf_url && <p className="mt-1 text-xs text-gray-500 break-all">Atual: {sale.nf_url}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contrato (PDF)</label>
          <input type="file" {...register("contrato_file")} className="w-full text-gray-900" accept=".pdf" />
          {sale?.contrato_url && <p className="mt-1 text-xs text-gray-500 break-all">Atual: {sale.contrato_url}</p>}
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Venda"}
      </button>
    </form>
  );
}