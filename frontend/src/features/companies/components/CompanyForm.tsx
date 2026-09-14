import { useState, type FormEvent } from "react";

interface CompanyFormProps {
  onSubmit: (name: string) => Promise<void>;
}

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setName("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de la empresa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="btn primary"
        disabled={isSubmitting || !name.trim()}
      >
        {isSubmitting ? "Creando..." : "Crear empresa"}
      </button>
    </form>
  );
}
