import { useEffect, useState } from "react";
import "./css/RegistroAcesso.css";

type Visitante = {
    id: number;
    data: string;
    nome: string;
    documento: string;
    departamento: string;
    motivo: string;
    entrada: string;
    saida: string;
    foto: string;
};

export default function RegistroAcesso() {
    const [visitantes, setVisitantes] = useState<Visitante[]>([]);

    useEffect(() => {
        document.title = "Registro de Acesso";

        fetch("http://localhost:3001/visitantes")
            .then((res) => res.json())
            .then((data) => setVisitantes(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="recepecao-container">
            <h2>Registro de Acesso</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Nome</th>
                        <th>Documento</th>
                        <th>Departamento</th>
                        <th>Motivo</th>
                        <th>Entrada</th>
                        <th>Saída</th>
                    </tr>
                </thead>
                <tbody>
                    {visitantes.map((v) => (

                        <tr key={v.id}>
                            <td>{v.data}</td>
                            <td>{v.nome}</td>
                            <td>{v.documento}</td>
                            <td>{v.departamento}</td>
                            <td>{v.motivo}</td>
                            <td>{v.entrada}</td>
                            <td>{v.saida}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
