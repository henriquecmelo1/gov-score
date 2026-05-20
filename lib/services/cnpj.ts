export type CnpjResult = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
};

export async function fetchCnpjInfo(cnpj: string): Promise<CnpjResult | null> {
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14) {
    return null;
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      name: data.razao_social || "",
      email: data.email || "",
      phone: data.ddd_telefone_1 || "",
      city: data.municipio || "",
      state: data.uf || "",
    };
  } catch (err) {
    console.error("Error fetching CNPJ data:", err);
    return null;
  }
}
