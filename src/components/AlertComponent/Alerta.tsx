import { useEffect } from "react";
import "./Alerta.css";

type alertaProps = {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    onClose: () => void;
    duration?: number; // tempo em ms
};

export default function alerta({
    message,
    type = "info",
    onClose,
    duration = 3000,
}: alertaProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`alerta alerta-${type}`}>
            <span>{message}</span>
            <button onClick={onClose}>✕</button>
        </div>
    );
}
