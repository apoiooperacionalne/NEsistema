import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        document.title = "NE Soluções"
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1>🏠 Página Inicial</h1>
            <p>Bem-vindo à Home!</p>
        </div>
    );
}
