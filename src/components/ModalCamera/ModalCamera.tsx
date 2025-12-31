import { useEffect, useRef, useState } from "react";
import "./ModalCamera.css";
import Alerta from "../AlertComponent/Alerta";

interface ModalCameraProps {
    onClose: () => void;
    onCapture: (foto: string) => void;
    fotoAtual?: string;
}

export default function ModalCamera({
    onClose,
    onCapture,
    fotoAtual,
}: ModalCameraProps) {

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [preview, setPreview] = useState<string>(fotoAtual || "");
    const [fotoSalva, setFotoSalva] = useState(false);

    // 🔔 ALERTA LOCAL DO MODAL
    const [alerta, setAlerta] = useState<{
        message: string;
        type: "success" | "error" | "warning" | "info";
    } | null>(null);

    // 🔒 Travar scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // 📷 Abrir câmera
    useEffect(() => {
        if (preview) return;

        const abrirCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch {
                setAlerta({
                    message: "Não foi possível acessar a câmera.",
                    type: "error",
                });
            }
        };

        abrirCamera();

        return () => {
            const video = videoRef.current;
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [preview]);

    // 📸 Capturar foto
    const tirarFoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            setAlerta({
                message: "Câmera ainda não está pronta.",
                type: "warning",
            });
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const foto = canvas.toDataURL("image/png");
        setPreview(foto);

        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        setAlerta({
            message: "Foto capturada com sucesso.",
            type: "success",
        });
    };

    // 💾 Salvar foto
    const salvarFoto = () => {
        if (!preview) {
            setAlerta({
                message: "Nenhuma foto para salvar.",
                type: "warning",
            });
            return;
        }

        onCapture(preview);
        setFotoSalva(true);

        setAlerta({
            message: "Foto salva com sucesso.",
            type: "success",
        });

        onClose();
    };

    // ❌ Fechar modal (verifica se salvou a foto)
    const fecharModal = () => {
        if (preview && !fotoSalva) {
            setAlerta({
                message: "A foto não foi salva.",
                type: "warning",
            });
            return;
        }

        onClose();
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

            <div className="Modal_Overlay" onClick={fecharModal}>
                <div
                    className="ModalCamera_Content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>{preview ? "Pré-visualização" : "Tirar Foto"}</h2>

                    {preview ? (
                        <>
                            <img
                                src={preview}
                                className="preview-foto"
                                alt="Pré-visualização"
                            />

                            <div className="preview-btns">
                                <button
                                    className="btn-novamente"
                                    onClick={() => {
                                        setPreview("");
                                        setFotoSalva(false);
                                    }}
                                >
                                    Tirar novamente
                                </button>

                                <button
                                    className="btn-salvar"
                                    onClick={salvarFoto}
                                >
                                    Salvar foto
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                className="camera-video"
                            />

                            <button
                                className="btn-capturar"
                                onClick={tirarFoto}
                            >
                                Capturar Foto
                            </button>
                        </>
                    )}

                    <button
                        className="btn-fechar"
                        onClick={fecharModal}
                    >
                        Cancelar
                    </button>

                    <canvas
                        ref={canvasRef}
                        style={{ display: "none" }}
                    />
                </div>
            </div>
        </>
    );
}
{/*TODO:ADICIONAR O POP-UP DE QUE AO SAIR SEM SALVAR AS ALTERAÇÕES NÃO ESTARÃO SALVAS*/}
{/*TODO:ADICIONAR O ALERTA DE QUE A FOTO FOI SALVA NO EDITAR */}