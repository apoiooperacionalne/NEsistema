import { useEffect, useState } from "react";
import ModalCadastro from "../components/ModalCadastro/ModalCadastro.tsx";
import ModalEditar from "../components/ModalEdit/ModalEdit.tsx";
import "./css/ControleAcesso.css";
import btn_add from "../../src/assets/img/btn_add.png";

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

export default function ControleAcesso() {
    const [visitantes, setVisitantes] = useState<Visitante[]>([]);
    const [showCadastro, setShowCadastro] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [visitanteSelecionado, setVisitanteSelecionado] = useState<Visitante | null>(null);

    const [paginaPendentes, setPaginaPendentes] = useState(1);
    const [paginaConcluidos, setPaginaConcluidos] = useState(1);

    const [linhasPorPaginaPendentes, setLinhasPorPaginaPendentes] = useState(5);
    const [linhasPorPaginaConcluidos, setLinhasPorPaginaConcluidos] = useState(5);

    const carregarVisitantes = async () => {
        try {
            const hoje = new Date().toISOString().split("T")[0];
            const res = await fetch(`http://localhost:3001/visitantes?data=${hoje}`);
            const data = await res.json();

            const ordenados = data.sort((a: Visitante, b: Visitante) => {
                const dataA = new Date(`${a.data}T${a.entrada}`);
                const dataB = new Date(`${b.data}T${b.entrada}`);
                return dataB.getTime() - dataA.getTime();
            });

            setVisitantes(ordenados);
        } catch (err) {
            console.error("Erro ao carregar visitantes:", err);
        }
    };

    useEffect(() => {
        document.title = "Controle de Acesso";
        carregarVisitantes();
    }, []);

    const abrirModalEditar = (visitante: Visitante) => {
        setVisitanteSelecionado(visitante);
        setShowEditar(true);
    };

    // ------------------------------
    // Separação dos registros
    const pendentes = visitantes.filter(v => v.saida === "00:00:00");
    const concluidos = visitantes.filter(v => v.saida !== "00:00:00");

    // Paginação PENDENTES — CORRIGIDO
    const totalPaginasPendentes = Math.max(
        1,
        Math.ceil(pendentes.length / linhasPorPaginaPendentes)
    );

    const inicioPendentes = (paginaPendentes - 1) * linhasPorPaginaPendentes;
    const pendentesPagina = pendentes.slice(inicioPendentes, inicioPendentes + linhasPorPaginaPendentes);

    // Paginação CONCLUÍDOS — CORRIGIDO
    const totalPaginasConcluidos = Math.max(
        1,
        Math.ceil(concluidos.length / linhasPorPaginaConcluidos)
    );

    const inicioConcluidos = (paginaConcluidos - 1) * linhasPorPaginaConcluidos;
    const concluidosPagina = concluidos.slice(inicioConcluidos, inicioConcluidos + linhasPorPaginaConcluidos);
    // ------------------------------

    // FUNÇÃO para gerar linhas especiais (altura fixa)
    const renderLinhasFixas = (dadosPagina: Visitante[], tipo: "pendentes" | "concluidos") => {
        const totalLinhas = tipo === "pendentes"
            ? linhasPorPaginaPendentes
            : linhasPorPaginaConcluidos;

        // Caso NÃO tenha nenhum registro → linha única grande
        if (dadosPagina.length === 0) {
            return (
                <tr className="linha-sem-registro unica">
                    <td colSpan={7}>
                        Nenhum registro {tipo === "pendentes" ? "pendente" : "concluído"}.
                    </td>
                </tr>
            );
        }

        // Renderiza as linhas reais
        const linhas = dadosPagina.map((v) => (
            <tr key={v.id} className="linha-clickavel" onClick={() => abrirModalEditar(v)}>
                <td>{v.data}</td>
                <td>{v.nome}</td>
                <td>{v.documento}</td>
                <td>{v.departamento}</td>
                <td>{v.motivo}</td>
                <td>{v.entrada}</td>
                <td>{v.saida}</td>
            </tr>
        ));

        // Renderiza uma única linha vazia se faltar completar as 5
        if (dadosPagina.length < totalLinhas) {
            const linhasRestantes = totalLinhas - dadosPagina.length;

            linhas.push(
                <tr
                    key={`espaco-${tipo}`}
                    className="linha-vazia-espaco"
                    style={{ height: `${linhasRestantes * 40}px` }}
                >
                    <td colSpan={7}></td>
                </tr>
            );
        }

        return linhas;
    };

    return (
        <div className="recepecao-container">

            <div className="controle">
                <h2 style={{ fontSize: "2rem" }}>Controle de Acesso</h2>
                <button className="Btn_Add" onClick={() => setShowCadastro(true)}>
                    <img src={btn_add} alt="Adicionar" className="Btn_Add_Img" />
                </button>
            </div>

            {/* TABELA PENDENTES */}
            <div>
                <h3 style={{ margin: "2rem 0rem 0rem 0rem", fontSize: "1.5rem" }}>Pendentes</h3>

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

                    <tbody>{renderLinhasFixas(pendentesPagina, "pendentes")}</tbody>
                </table>

                {/* Paginação */}
                <div className="paginacao-container">
                    <div className="select-container">
                        <label>Mostrar: </label>
                        <select
                            value={linhasPorPaginaPendentes}
                            onChange={(e) => {
                                setLinhasPorPaginaPendentes(Number(e.target.value));
                                setPaginaPendentes(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span> linhas por página</span>
                    </div>

                    <div className="botoes-paginacao">
                        <button
                            disabled={paginaPendentes === 1}
                            onClick={() => setPaginaPendentes(paginaPendentes - 1)}
                        >
                            ◀
                        </button>

                        <span>Página {paginaPendentes} de {totalPaginasPendentes}</span>

                        <button
                            disabled={paginaPendentes === totalPaginasPendentes}
                            onClick={() => setPaginaPendentes(paginaPendentes + 1)}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* ------------------------------ */}
            {/* TABELA CONCLUÍDOS */}
            {/* ------------------------------ */}
            <div>
                <h3 style={{ margin: "2rem 0rem 0rem 0rem", fontSize: "1.5rem" }}>Concluídos</h3>

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

                    <tbody>{renderLinhasFixas(concluidosPagina, "concluidos")}</tbody>
                </table>

                {/* Paginação */}
                <div className="paginacao-container">
                    <div className="select-container">
                        <label>Mostrar: </label>
                        <select
                            value={linhasPorPaginaConcluidos}
                            onChange={(e) => {
                                setLinhasPorPaginaConcluidos(Number(e.target.value));
                                setPaginaConcluidos(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span> linhas por página</span>
                    </div>

                    <div className="botoes-paginacao">
                        <button
                            disabled={paginaConcluidos === 1}
                            onClick={() => setPaginaConcluidos(paginaConcluidos - 1)}
                        >
                            ◀
                        </button>

                        <span>Página {paginaConcluidos} de {totalPaginasConcluidos}</span>

                        <button
                            disabled={paginaConcluidos === totalPaginasConcluidos}
                            onClick={() => setPaginaConcluidos(paginaConcluidos + 1)}
                        >
                            ▶
                        </button>
                    </div>
                </div>

                {/* BOTÃO ADICIONAR */}

                {/* MODAIS */}
                {showCadastro && (
                    <ModalCadastro
                        onClose={() => setShowCadastro(false)}
                        onSave={carregarVisitantes}
                    />
                )}

                {showEditar && visitanteSelecionado && (
                    <ModalEditar
                        visitante={visitanteSelecionado}
                        onClose={() => {
                            setShowEditar(false);
                            setVisitanteSelecionado(null);
                        }}
                        onSave={carregarVisitantes}
                    />
                )}
            </div>
        </div>
    );
}
