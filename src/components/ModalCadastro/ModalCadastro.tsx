import { useState, useEffect } from "react";
import "./ModalCadastro.css";

import camera_marelo_btn from "../../assets/img/camera_marelo_btn.png";
import save_marelo_btn from "../../assets/img/save_marelo_btn.png";
import block from "../../assets/img/block.png";

import ModalCamera from "../ModalCamera/ModalCamera";

export default function ModalCadastro({ onClose, onSave }) {

    // trava scroll ao abrir
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const getHoraAtual = () => {
        const agora = new Date();
        const h = String(agora.getHours()).padStart(2, "0");
        const m = String(agora.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    };

    const [formData, setFormData] = useState({
        nome: "",
        documento: "",
        departamento: "",
        motivo: "",
        entrada: "",
        foto: "" // recebe apenas o base64, sem preview no modal pai
    });

    const [tipoDocumento, setTipoDocumento] = useState("Mat");
    const [documentoMascara, setDocumentoMascara] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [formValid, setFormValid] = useState(false);

    const [modalCameraAberto, setModalCameraAberto] = useState(false);

    const isSaveDisabled = !formValid || isSaving;

    // preenche hora automática
    useEffect(() => {
        setFormData((prev) => ({ ...prev, entrada: getHoraAtual() }));
    }, []);

    const departamentosLista = ["RH", "DP", "ST", "OP", "ADM"];

    const handleDepartamentoChange = (dep) => {
        setFormData((prev) => {
            const selecionados = prev.departamento.split(", ").filter(Boolean);
            const jaTem = selecionados.includes(dep);

            const novos = jaTem
                ? selecionados.filter((d) => d !== dep)
                : [...selecionados, dep];

            return { ...prev, departamento: novos.join(", ") };
        });
    };

    const aplicarMascara = (valor) => {
        let somenteNumeros = valor.replace(/\D/g, "");

        if (tipoDocumento === "Mat") {
            return somenteNumeros.slice(0, 6);
        }

        if (tipoDocumento === "CPF") {
            return somenteNumeros
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{2})$/, "$1-$2");
        }

        if (tipoDocumento === "RG") {
            return somenteNumeros
                .slice(0, 7)
                .replace(/(\d{1})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2");
        }

        return valor;
    };

    const handleDocumento = (e) => {
        const valorDigitado = e.target.value;
        const valorMascara = aplicarMascara(valorDigitado);

        setDocumentoMascara(valorMascara);
        setFormData({
            ...formData,
            documento: valorDigitado.replace(/\D/g, "")
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // validação
    useEffect(() => {
        const valid =
            formData.nome.trim() &&
            formData.documento.trim() &&
            formData.departamento.trim() &&
            formData.motivo.trim() &&
            formData.entrada.trim();

        setFormValid(valid);
    }, [formData]);

    // enviar
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaveDisabled) return;

        setIsSaving(true);

        const visitantePronto = {
            ...formData,
            entrada: getHoraAtual(),
            data: new Date().toISOString().split("T")[0],
            saida: "00:00:00"
        };

        try {
            const response = await fetch(
                import.meta.env.VITE_API_URL + "/visitantes",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(visitantePronto)
                }
            );

            if (response.ok) {
                alert("Visitante cadastrado com sucesso!");
                onSave && onSave();
                onClose();
            } else {
                alert("Erro ao cadastrar visitante.");
            }
        } catch (error) {
            alert("Falha ao conectar ao servidor.");
        }

        setIsSaving(false);
    };

    return (
        <div className="Modal_Overlay" onClick={() => !modalCameraAberto && onClose()}>
            <div className="Modal_Content" onClick={(e) => e.stopPropagation()}>
                <h2>Cadastro de Visitante</h2>

                <form onSubmit={handleSubmit} className="Modal_Form">

                    <div className="Form_Grid">

                        <label className="field-nome">
                            Nome:
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                placeholder="Nome completo"
                            />
                        </label>

                        <label className="field-tipo">
                            Tipo de Documento:
                            <select
                                value={tipoDocumento}
                                onChange={(e) => {
                                    setTipoDocumento(e.target.value);
                                    setDocumentoMascara("");
                                    setFormData({ ...formData, documento: "" });
                                }}
                            >
                                <option value="Mat">Mat</option>
                                <option value="CPF">CPF</option>
                                <option value="RG">RG</option>
                            </select>
                        </label>

                        <label className="field-documento">
                            Documento:
                            <input
                                type="text"
                                value={documentoMascara}
                                onChange={handleDocumento}
                                required
                            />
                        </label>

                        <label className="field-entrada">
                            Horário de Entrada:
                            <input
                                type="time"
                                name="entrada"
                                value={formData.entrada}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    {/* DEPARTAMENTOS */}
                    <div>
                        <p><strong>Departamentos:</strong></p>
                        <div className="Departamento_Grid">
                            {departamentosLista.map((dep) => (
                                <label key={dep} className="checkboxLabel">
                                    <input
                                        type="checkbox"
                                        checked={formData.departamento.includes(dep)}
                                        onChange={() => handleDepartamentoChange(dep)}
                                    />
                                    {dep}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* MOTIVO */}
                    <label className="Motivo_Text">
                        Motivo da Entrada:
                        <textarea
                            name="motivo"
                            rows={3}
                            placeholder="Descreva o motivo da entrada"
                            value={formData.motivo}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    {/* Botão de foto */}
                    <div className="Camera_Section">
                        <button
                            type="button"
                            className="Camera_Btn"
                            onClick={() => setModalCameraAberto(true)}
                        >
                            <img src={camera_marelo_btn} alt="Foto" />
                            <p>Foto</p>
                        </button>
                    </div>

                    {/* BOTÕES */}
                    <div className="Modal_Btns">

                        <button
                            type="submit"
                            className="Modal_Save_Btn"
                            disabled={isSaveDisabled}
                        >
                            {isSaveDisabled ? (
                                <img src={block} alt="Bloqueado" className="block-icon" />
                            ) : (
                                <>
                                    <span>Salvar</span>
                                    <img src={save_marelo_btn} alt="Salvar" className="save-icon" />
                                </>
                            )}
                        </button>

                        <button type="button" className="Modal_Close_Btn" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>

                </form>
            </div>

            {/* Modal de Câmera */}
            {modalCameraAberto && (
                <ModalCamera
                    fotoAtual={formData.foto}
                    onClose={() => setModalCameraAberto(false)}
                    onCapture={(fotoDataURL) => {
                        setFormData((p) => ({ ...p, foto: fotoDataURL }));
                        setModalCameraAberto(false);
                    }}
                />
            )}
        </div>
    );
}
