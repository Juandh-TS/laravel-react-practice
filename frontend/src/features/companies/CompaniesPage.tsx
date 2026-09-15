import { useEffect, useState } from "react";
import { Badge } from "@/components/common/Badge";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Spinner } from "@/components/common/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { companiesApi } from "./api/companiesApi";
import { CompanyForm } from "./components/CompanyForm";
import { CompanyItem } from "./components/CompanyItem";
import type { Company } from "./types";

export function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    companiesApi
      .list()
      .then(setCompanies)
      .catch(() =>
        setError(
          "No se pudo conectar con la API. Asegurate que el backend esté corriendo.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(name: string) {
    setFormError(null);
    try {
      const company = await companiesApi.create({ name });
      setCompanies((current) => [{ ...company, users_count: 0 }, ...current]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo crear la empresa.";
      setFormError(message);
      throw err;
    }
  }

  async function handleUpdate(id: number, name: string) {
    setFormError(null);
    try {
      const updated = await companiesApi.update(id, { name });
      setCompanies((current) =>
        current.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la empresa.",
      );
      throw err;
    }
  }

  async function handleDelete(id: number) {
    setFormError(null);
    try {
      await companiesApi.remove(id);
      setCompanies((current) => current.filter((c) => c.id !== id));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo borrar la empresa.",
      );
    }
  }

  return (
    <>
      <h1>
        Empresas
        {!loading && !error && <Badge count={companies.length} />}
      </h1>
      <p className="subtitle">Gestión de empresas vinculadas a los usuarios</p>

      {isAdmin && <CompanyForm onSubmit={handleCreate} />}

      <ErrorAlert message={formError} />
      <ErrorAlert message={error} />

      {loading && <Spinner message="Cargando empresas..." />}

      {!loading && !error && companies.length === 0 && (
        <p className="state-message">No hay empresas registradas aún.</p>
      )}

      <ul className="user-list">
        {companies.map((company) => (
          <CompanyItem
            key={company.id}
            company={company}
            isAdmin={isAdmin}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </>
  );
}
