import { useState, useEffect } from "react";
import "./ModalCadastro.css";

import camera_marelo_btn from "../../assets/img/camera_marelo_btn.png";
import camera_preto_btn from "../../assets/img/camera_preto_btn.png";
import save_marelo_btn from "../../assets/img/save_marelo_btn.png";
import save_preto_btn from "../../assets/img/save_preto_btn.png";
import block from "../../assets/img/block.png";

import ModalCamera from "../ModalCamera/ModalCamera";
import Alerta from "../AlertComponent/Alerta";

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
        tipoDocumento: "Mat",
        documento: "",
        departamento: [] as string[],
        motivo: "",
        entrada: "",
        foto: ""
    });

    const [documentoMascara, setDocumentoMascara] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [modalCameraAberto, setModalCameraAberto] = useState(false);

    // 🔔 ALERTA
    const [alerta, setAlerta] = useState<{
        message: string;
        type: "success" | "error" | "warning" | "info";
    } | null>(null);

    const isSaveDisabled = !formValid || isSaving;

    // preenche hora automática
    useEffect(() => {
        setFormData((prev) => ({ ...prev, entrada: getHoraAtual() }));
    }, []);

    const departamentosLista = ["RH", "DP", "ST", "OP", "ADM"];

    const handleDepartamentoChange = (dep: string) => {
        setFormData((prev) => ({
            ...prev,
            departamento: prev.departamento.includes(dep)
                ? prev.departamento.filter((d) => d !== dep)
                : [...prev.departamento, dep]
        }));
    };

    const aplicarMascara = (valor: string) => {
        const somenteNumeros = valor.replace(/\D/g, "");

        if (formData.tipoDocumento === "Mat") {
            return somenteNumeros.slice(0, 6);
        }

        if (formData.tipoDocumento === "CPF") {
            return somenteNumeros
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{2})$/, "$1-$2");
        }

        if (formData.tipoDocumento === "RG") {
            return somenteNumeros
                .slice(0, 7)
                .replace(/(\d{1})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2");
        }

        return valor;
    };

    const handleDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valorDigitado = e.target.value;
        const valorMascara = aplicarMascara(valorDigitado);

        setDocumentoMascara(valorMascara);
        setFormData({
            ...formData,
            documento: valorDigitado.replace(/\D/g, "")
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // validação
    useEffect(() => {
        const valid =
            formData.nome.trim() &&
            formData.documento.trim() &&
            formData.departamento.length > 0 &&
            formData.motivo.trim() &&
            formData.entrada.trim();

        setFormValid(!!valid);
    }, [formData]);

    // enviar
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaveDisabled) return;

        setIsSaving(true);

        const visitantePronto = {
            ...formData,
            entrada: getHoraAtual(),
            data: new Date().toISOString().split("T")[0],
            saida: "00:00:00"
        };

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

        try {
            const response = await fetch(`${API_URL}/visitantes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(visitantePronto)
            });

            if (response.ok) {
                setAlerta({
                    message: "Visitante cadastrado com sucesso!",
                    type: "success"
                });

                onSave && onSave();

                setTimeout(() => {
                    onClose();
                }, 500);
            } else {
                setAlerta({
                    message: "Erro ao cadastrar visitante.",
                    type: "error"
                });
            }
        } catch {
            setAlerta({
                message: "Falha ao conectar ao servidor.",
                type: "error"
            });
        }

        setIsSaving(false);
    };

    return (
        <>
            {/* 🔔 ALERTA */}
            {alerta && (
                <Alerta
                    message={alerta.message}
                    type={alerta.type}
                    onClose={() => setAlerta(null)}
                />
            )}

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
                                    value={formData.tipoDocumento}
                                    onChange={(e) => {
                                        setDocumentoMascara("");
                                        setFormData({
                                            ...formData,
                                            tipoDocumento: e.target.value,
                                            documento: ""
                                        });
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
                        </div>

                        <div className="Modal_Btns">
                            <button
                                type="submit"
                                className="Modal_Save_Btn"
                                disabled={isSaveDisabled}
                            >
                                {isSaveDisabled ? (
                                    <img src={block} />
                                ) : (
                                    <>
                                        <span>Salvar</span>
                                        <img src={save_marelo_btn} className="icon-default" />
                                        <img src={save_preto_btn} className="icon-hover" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="Modal_Close_Btn"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>

                    </form>
                </div>

                {modalCameraAberto && (
                    <ModalCamera
                        fotoAtual={formData.foto}
                        onClose={() => setModalCameraAberto(false)}
                        onCapture={(fotoDataURL) => {
                            setFormData((p) => ({ ...p, foto: fotoDataURL }));
                            setModalCameraAberto(false);

                            // 🔔 ALERTA DE FOTO SALVA
                            setAlerta({
                                message: "Foto salva com sucesso.",
                                type: "success"
                            });
                        }}
                    />
                )}
            </div>
        </>
    );
}
{/*TODO:ADICIONAR O POP-UP DE QUE AO SAIR SEM SALVAR AS ALTERAÇÕES NÃO ESTARÃO SALVAS*/}