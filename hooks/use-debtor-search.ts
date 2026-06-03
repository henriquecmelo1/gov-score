import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { fetchCnpjInfo } from "@/lib/services/cnpj";
import { formatPhone } from "@/lib/formatters/input-formatters";
import { formatCNPJ } from "@/components/sales/debtor-section";
import type { SaleInput } from "@/lib/schemas/inputs/sales";
import type { Debtor, DebtorCreateInput } from "@/lib/schemas/debtors";

type UseDebtorSearchReturn = {
  cnpjSearch: string;
  setCnpjSearch: (value: string) => void;
  isSearchingCnpj: boolean;
  isNewDebtor: boolean;
  newDebtorData: Partial<DebtorCreateInput>;
  lockedDebtorFields: Record<string, boolean>;
  handleCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleNewDebtorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Resets all debtor-related state (e.g. after successful form submission). */
  resetDebtorState: () => void;
};

const EMPTY_DEBTOR_DATA: Partial<DebtorCreateInput> = {
  name: "", email: "", cnpj: "", phone: "", city: "", state: "",
};

export function useDebtorSearch(
  debtors: Debtor[],
  setValue: UseFormSetValue<SaleInput>,
): UseDebtorSearchReturn {
  const [cnpjSearch, setCnpjSearch] = useState("");
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isNewDebtor, setIsNewDebtor] = useState(false);
  const [newDebtorData, setNewDebtorData] = useState<Partial<DebtorCreateInput>>(
    { ...EMPTY_DEBTOR_DATA },
  );
  const [lockedDebtorFields, setLockedDebtorFields] = useState<Record<string, boolean>>({});

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpjSearch(formatted);

    const cleanCnpj = e.target.value.replace(/\D/g, "");
    setIsNewDebtor(false);
    setValue("entidade_devedora", "", { shouldValidate: true });

    if (cleanCnpj.length !== 14) return;

    const existing = debtors.find(d => d.cnpj === cleanCnpj);
    if (existing) {
      setValue("entidade_devedora", String(existing.id), { shouldValidate: true });
      return;
    }

    setIsSearchingCnpj(true);
    try {
      const cnpjData = await fetchCnpjInfo(cleanCnpj);
      setIsNewDebtor(true);

      if (cnpjData) {
        setNewDebtorData({
          name: cnpjData.name, email: cnpjData.email, cnpj: cleanCnpj,
          phone: cnpjData.phone, city: cnpjData.city, state: cnpjData.state,
        });
        setLockedDebtorFields({
          name: !!cnpjData.name, email: !!cnpjData.email, phone: !!cnpjData.phone,
          city: !!cnpjData.city, state: !!cnpjData.state,
        });
      } else {
        setNewDebtorData({ ...EMPTY_DEBTOR_DATA, cnpj: cleanCnpj });
        setLockedDebtorFields({});
      }
      setValue("entidade_devedora", "NEW", { shouldValidate: true });
    } catch {
      setIsNewDebtor(true);
      setNewDebtorData({ ...EMPTY_DEBTOR_DATA, cnpj: cleanCnpj });
      setLockedDebtorFields({});
      setValue("entidade_devedora", "NEW", { shouldValidate: true });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleNewDebtorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const finalValue = name === "phone" ? formatPhone(value) : value;
    setNewDebtorData(prev => ({ ...prev, [name]: finalValue }));
  };

  const resetDebtorState = () => {
    setCnpjSearch("");
    setIsNewDebtor(false);
    setNewDebtorData({ ...EMPTY_DEBTOR_DATA });
    setLockedDebtorFields({});
  };

  return {
    cnpjSearch,
    setCnpjSearch,
    isSearchingCnpj,
    isNewDebtor,
    newDebtorData,
    lockedDebtorFields,
    handleCnpjChange,
    handleNewDebtorChange,
    resetDebtorState,
  };
}
