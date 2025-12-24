import { useEffect, useState } from "react";
import "./ModalEdit.css";

import save_marelo_btn from "../../assets/img/save_marelo_btn.png";
import save_preto_btn from "../../assets/img/save_preto_btn.png";
import block from "../../assets/img/block.png";
import camera_marelo_btn from "../../assets/img/camera_marelo_btn.png";
import camera_preto_btn from "../../assets/img/camera_preto_btn.png";

import ModalCamera from "../ModalCamera/ModalCamera";

export default function ModalEditar({ visitante, onClose, onSave }) {
    const [form, setForm] = useState({
        ...visitante,
        departamento: Array.isArray(visitante.departamento)
            ? visitante.departamento
            : visitante.departamento?.split(", ").filter(Boolean) || []
    });

    const [documentoMascara, setDocumentoMascara] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [formValid, setFormValid] = useState(true);
    const [modalCameraAberto, setModalCameraAberto] = useState(false);

    const departamentosLista = ["RH", "DP", "ST", "OP", "ADM"];

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, []);

    // 👉 aplica máscara inicial ao abrir
    useEffect(() => {
        setDocumentoMascara(aplicarMascara(form.documento || ""));
    }, []);

    const aplicarMascara = (valor) => {
        const numeros = valor.replace(/\D/g, "");

        if (form.tipoDocumento === "Mat") {
            return numeros.slice(0, 6);
        }

        if (form.tipoDocumento === "CPF") {
            return numeros
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{2})$/, "$1-$2");
        }

        if (form.tipoDocumento === "RG") {
            return numeros
                .slice(0, 7)
                .replace(/(\d{1})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2");
        }

        return valor;
    };

    const handleDocumentoChange = (e) => {
        const valorDigitado = e.target.value;
        const valorMascara = aplicarMascara(valorDigitado);

        setDocumentoMascara(valorMascara);
        setForm((prev) => ({
            ...prev,
            documento: valorDigitado.replace(/\D/g, "")
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDepartamentoChange = (dep) => {
        setForm((prev) => ({
            ...prev,
            departamento: prev.departamento.includes(dep)
                ? prev.departamento.filter((d) => d !== dep)
                : [...prev.departamento, dep],
        }));
    };

    useEffect(() => {
        const valid =
            form.nome?.trim() &&
            form.documento?.trim() &&
            form.departamento.length > 0 &&
            form.motivo?.trim() &&
            form.entrada?.trim();

        setFormValid(!!valid);
    }, [form]);

    const definirHoraAtual = () => {
        const agora = new Date();
        const h = String(agora.getHours()).padStart(2, "0");
        const m = String(agora.getMinutes()).padStart(2, "0");
        setForm((prev) => ({ ...prev, saida: `${h}:${m}` }));
    };

    const handleSave = async () => {
        if (!formValid || isSaving) return;

        setIsSaving(true);

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

        try {
            await fetch(`${API_URL}/visitantes/${form.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form),
            });

            onSave?.();
            onClose();
        } catch {
            alert("Erro ao salvar.");
        }

        setIsSaving(false);
    };

    return (
        <div className="Modal_Overlay" onClick={() => !modalCameraAberto && onClose()}>
            <div className="Modal_Content" onClick={(e) => e.stopPropagation()}>
                <h2>Editar Visitante</h2>

                <div className="Modal_Form">
                    <div className="Form_Grid">
                        <label className="field-nome">
                            Nome:
                            <input
                                type="text"
                                name="nome"
                                value={form.nome || ""}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="field">
                            {form.tipoDocumento}
                            <input
                                type="text"
                                value={documentoMascara}
                                onChange={handleDocumentoChange}
                            />
                        </label>

                        <label className="field">
                            Entrada:
                            <input
                                type="time"
                                name="entrada"
                                value={form.entrada || ""}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="field">
                            Saída:
                            <input
                                type="time"
                                name="saida"
                                value={form.saida || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div>
                        <p><strong>Departamentos:</strong></p>
                        <div className="Departamento_Grid">
                            {departamentosLista.map((dep) => (
                                <label key={dep} className="checkboxLabel">
                                    <input
                                        type="checkbox"
                                        checked={form.departamento.includes(dep)}
                                        onChange={() => handleDepartamentoChange(dep)}
                                    />
                                    {dep}
                                </label>
                            ))}
                        </div>
                    </div>

                    <label className="Motivo_Text">
                        Motivo:
                        <textarea
                            name="motivo"
                            rows={3}
                            value={form.motivo || ""}
                            onChange={handleChange}
                        />
                    </label>

                    <div className="Action_Buttons">
                        <button
                            type="button"
                            className="Action_Btn camera-btn"
                            onClick={() => setModalCameraAberto(true)}
                        >
                            <img src={camera_preto_btn} className="icon-default" />
                            <img src={camera_marelo_btn} className="icon-hover" />
                            <span>Foto</span>
                        </button>

                        <button
                            type="button"
                            className="Action_Btn"
                            onClick={definirHoraAtual}
                        >
                            Saída Agora
                        </button>
                    </div>

                    <div className="Modal_Btns">
                        <button
                            className="Modal_Save_Btn"
                            onClick={handleSave}
                            disabled={!formValid || isSaving}
                        >
                            {!formValid || isSaving ? (
                                <img src={block} />
                            ) : (
                                <>
                                    <span>Salvar</span>
                                    <img src={save_marelo_btn} className="icon-default" />
                                    <img src={save_preto_btn} className="icon-hover" />
                                </>
                            )}
                        </button>

                        <button className="Modal_Close_Btn" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {modalCameraAberto && (
                <ModalCamera
                    fotoAtual={form.foto}
                    onClose={() => setModalCameraAberto(false)}
                    onCapture={(foto) => {
                        setForm((p) => ({ ...p, foto }));
                        setModalCameraAberto(false);
                    }}
                />
            )}
        </div>
    );
}
