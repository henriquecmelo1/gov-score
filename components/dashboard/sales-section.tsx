"use client";

import { useState } from "react";
import { SalesList } from "./sales-list";
import { NewSaleForm } from "./new-sale-form"; // O formulário que criamos anteriormente

export function SalesSection({ initialSales }: { initialSales: any[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {showForm ? "Cadastrar Nova Venda" : "Minhas Vendas"}
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${
            showForm ? "bg-gray-500" : "bg-blue-600"
          } text-white px-4 py-2 rounded hover:opacity-90 transition`}
        >
          {showForm ? "Cancelar" : "Nova Venda"}
        </button>
      </div>

      {showForm ? (
        <div className="animate-in fade-in duration-300">
          {/* Ao ter sucesso no cadastro, fechamos o formulário */}
          <NewSaleForm onSuccess={() => setShowForm(false)} />
        </div>
      ) : (
        <SalesList sales={initialSales} />
      )}
    </section>
  );
}