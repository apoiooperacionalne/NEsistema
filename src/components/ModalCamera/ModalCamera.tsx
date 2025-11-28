import { useEffect, useRef, useState } from "react";
import "./ModalCamera.css";

export default function ModalCamera({ onClose, onCapture, fotoAtual }) {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [preview, setPreview] = useState(fotoAtual || ""); // se já tiver foto, mostra preview

    // Travar scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    // --------- ABRIR CÂMERA ---------
    useEffect(() => {
        if (preview) return; // se tem preview, não abrir a câmera

        const abrirCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch {
                alert("Não foi possível acessar a câmera.");
                onClose();
            }
        };

        abrirCamera();

        return () => {
            const video = videoRef.current;
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, [preview]);

    // --------- CAPTURAR FOTO ---------
    const tirarFoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const foto = canvas.toDataURL("image/png");
        setPreview(foto); // ativa modo preview

        // parar a câmera ao capturar
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(t => t.stop());
        }
    };

    // --------- SALVAR A FOTO ---------
    const salvarFoto = () => {
        if (!preview) return;
        onCapture(preview);
        onClose();
    };

    return (
        <div className="Modal_Overlay" onClick={onClose}>
            <div className="ModalCamera_Content" onClick={(e) => e.stopPropagation()}>

                <h2>{preview ? "Pré-visualização" : "Tirar Foto"}</h2>

                {/* MODO PREVIEW */}
                {preview ? (
                    <>
                        <img src={preview} className="preview-foto" alt="preview" />

                        <div className="preview-btns">
                            <button className="btn-novamente" onClick={() => setPreview("")}>
                                Tirar novamente
                            </button>

                            <button className="btn-salvar" onClick={salvarFoto}>
                                Salvar foto
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* MODO CÂMERA */}
                        <video ref={videoRef} autoPlay className="camera-video"></video>

                        <button className="btn-capturar" onClick={tirarFoto}>
                            Capturar Foto
                        </button>
                    </>
                )}

                <button className="btn-fechar" onClick={onClose}>
                    Cancelar
                </button>

                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </div>
    );
}
