import { useState } from "react";
import "./ModalEdit.css";

export default function ModalEditar({ visitante, onClose, onSave }) {
    const [form, setForm] = useState({ ...visitante });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 👉 Função para preencher o horário atual
    const definirHoraAtual = () => {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, "0");
        const minutos = String(agora.getMinutes()).padStart(2, "0");
        const horaAtual = `${horas}:${minutos}`;

        setForm((prev) => ({ ...prev, saida: horaAtual }));
    };

    const handleSave = async () => {
        try {
            await fetch(`http://localhost:3001/visitantes/${form.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            onSave();
            onClose();
        } catch (err) {
            console.error("Erro ao salvar alterações:", err);
        }
    };

    return (
        <div className="Modal_Overlay">
            <div className="Modal_Content">
                <h3>Editar Visitante</h3>

                <div className="Modal_Form">
                    <label>
                        Nome:
                        <input
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Documento:
                        <input
                            type="text"
                            name="documento"
                            value={form.documento}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Departamento:
                        <input
                            type="text"
                            name="departamento"
                            value={form.departamento}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Motivo:
                        <input
                            type="text"
                            name="motivo"
                            value={form.motivo}
                            onChange={handleChange}
                        />
                    </label>

                    <div className="Form_Grid">
                        <label>
                            Entrada:
                            <input
                                type="time"
                                name="entrada"
                                value={form.entrada}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="saida-label">
                            Saída:
                            <div className="saida-container">
                                <input
                                    type="time"
                                    name="saida"
                                    value={form.saida}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="btn-hora-atual"
                                    onClick={definirHoraAtual}
                                >
                                    Agora
                                </button>
                            </div>
                        </label>
                    </div>

                    {form.foto && (
                        <div className="Foto_Section">
                            <p>Foto registrada:</p>
                            <img src={form.foto} alt="Foto do visitante" />
                        </div>
                    )}
                </div>

                <div className="Modal_Btns">
                    <button className="Modal_Save_Btn" onClick={handleSave}>
                        Salvar
                    </button>
                    <button className="Modal_Close_Btn" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
