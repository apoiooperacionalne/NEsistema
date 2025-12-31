import { useEffect, useState } from "react";
import ModalCadastro from "../components/ModalCadastro/ModalCadastro.tsx";
import ModalEditar from "../components/ModalEdit/ModalEdit.tsx";
import Alert from "../components/AlertComponent/Alerta.tsx";
import "./css/ControleAcesso.css";
import btn_add from "../../src/assets/img/btn_add.png";
import sync_white from "../../src/assets/img/sync_white.png";

type Visitante = {
    id: number;
    data: string;
    nome: string;
    documento: string;
    departamento: string | string[];
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

    const [syncLoading, setSyncLoading] = useState(false);

    const [alertCadastro, setAlertCadastro] = useState<AlertState>(null);
    const [alertSync, setAlertSync] = useState<AlertState>(null);
    const [alertEdicao, setAlertEdicao] = useState<AlertState>(null);


    const carregarVisitantes = async (mostrarAlerta = true) => {
        try {
            setSyncLoading(true);

            const hoje = new Date().toISOString().split("T")[0];
            const res = await fetch(`http://localhost:3001/visitantes?data=${hoje}`);
            const data = await res.json();

            const ordenados = data.sort((a: Visitante, b: Visitante) => {
                const dataA = new Date(`${a.data}T${a.entrada}`);
                const dataB = new Date(`${b.data}T${b.entrada}`);
                return dataB.getTime() - dataA.getTime();
            });

            setVisitantes(ordenados);

            if (mostrarAlerta) {
                setAlertSync({
                    message: "Visitantes sincronizados com sucesso!",
                    type: "success",
                });
            }
        } catch {
            setAlertSync({
                message: "Erro ao carregar visitantes.",
                type: "error",
            });
        } finally {
            setSyncLoading(false);
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

    // Paginação PENDENTES
    const totalPaginasPendentes = Math.max(
        1,
        Math.ceil(pendentes.length / linhasPorPaginaPendentes)
    );

    const inicioPendentes = (paginaPendentes - 1) * linhasPorPaginaPendentes;
    const pendentesPagina = pendentes.slice(
        inicioPendentes,
        inicioPendentes + linhasPorPaginaPendentes
    );

    // Paginação CONCLUÍDOS
    const totalPaginasConcluidos = Math.max(
        1,
        Math.ceil(concluidos.length / linhasPorPaginaConcluidos)
    );

    const inicioConcluidos = (paginaConcluidos - 1) * linhasPorPaginaConcluidos;
    const concluidosPagina = concluidos.slice(
        inicioConcluidos,
        inicioConcluidos + linhasPorPaginaConcluidos
    );
    // ------------------------------

    // Renderização das linhas fixas
    const renderLinhasFixas = (
        dadosPagina: Visitante[],
        tipo: "pendentes" | "concluidos"
    ) => {
        const totalLinhas =
            tipo === "pendentes"
                ? linhasPorPaginaPendentes
                : linhasPorPaginaConcluidos;

        if (dadosPagina.length === 0) {
            return (
                <tr className="linha-sem-registro unica">
                    <td colSpan={7}>
                        Nenhum registro {tipo === "pendentes" ? "pendente" : "concluído"}.
                    </td>
                </tr>
            );
        }

        const linhas = dadosPagina.map((v) => (
            <tr
                key={v.id}
                className="linha-clickavel"
                onClick={() => abrirModalEditar(v)}
            >
                <td>{v.data}</td>
                <td>{v.nome}</td>
                <td>{v.documento}</td>
                <td>
                    {Array.isArray(v.departamento)
                        ? v.departamento.join(", ")
                        : v.departamento}
                </td>
                <td>{v.motivo}</td>
                <td>{v.entrada}</td>
                <td>{v.saida}</td>
            </tr>
        ));

        if (dadosPagina.length < totalLinhas) {
            linhas.push(
                <tr
                    key={`espaco-${tipo}`}
                    className="linha-vazia-espaco"
                    style={{ height: `${(totalLinhas - dadosPagina.length) * 40}px` }}
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

                <button
                    className={`Btn_Sync ${syncLoading ? "loading" : ""}`}
                    onClick={carregarVisitantes}
                    disabled={syncLoading}
                    title="Sincronizar"
                >
                    <img
                        src={sync_white}
                        alt="Sincronizar"
                        className="Btn_Sync_Img"
                    />
                </button>

                <button className="Btn_Add" onClick={() => setShowCadastro(true)}>
                    <img src={btn_add} alt="Adicionar" className="Btn_Add_Img" />
                </button>
            </div>

            {/* ===================== PENDENTES ===================== */}
            <div>
                <h3 style={{ margin: "2rem 0 0 0", fontSize: "1.5rem" }}>
                    Pendentes ({pendentes.length})
                </h3>

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
                            <option value={10} disabled={pendentes.length < 10}>10</option>
                            <option value={20} disabled={pendentes.length < 20}>20</option>
                            <option value={50} disabled={pendentes.length < 50}>50</option>
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

                        <span>
                            Página {paginaPendentes} de {totalPaginasPendentes}
                        </span>

                        <button
                            disabled={paginaPendentes === totalPaginasPendentes}
                            onClick={() => setPaginaPendentes(paginaPendentes + 1)}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* ===================== CONCLUÍDOS ===================== */}
            <div>
                <h3 style={{ margin: "2rem 0 0 0", fontSize: "1.5rem" }}>
                    Concluídos ({concluidos.length})
                </h3>

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
                            <option value={10} disabled={concluidos.length < 10}>10</option>
                            <option value={20} disabled={concluidos.length < 20}>20</option>
                            <option value={50} disabled={concluidos.length < 50}>50</option>
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

                        <span>
                            Página {paginaConcluidos} de {totalPaginasConcluidos}
                        </span>

                        <button
                            disabled={paginaConcluidos === totalPaginasConcluidos}
                            onClick={() => setPaginaConcluidos(paginaConcluidos + 1)}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* ===================== MODAIS ===================== */}
            {showCadastro && (
                <ModalCadastro
                    onClose={() => setShowCadastro(false)}
                    onSave={() => {
                        carregarVisitantes(false);
                        setAlertCadastro({
                            message: "Visitante cadastrado com sucesso!",
                            type: "success",
                        });
                    }}
                />

            )}

            {showEditar && visitanteSelecionado && (
                <ModalEditar
                    visitante={visitanteSelecionado}
                    onClose={() => {
                        setShowEditar(false);
                        setVisitanteSelecionado(null);
                    }}
                    onSave={() => {
                        carregarVisitantes(false);
                        setAlertEdicao({
                            message: "Cadastro atualizado com sucesso!",
                            type: "success",
                        });
                    }}
                />

            )}

            {/* ===================== ALERTAS ===================== */}
            {alertCadastro && (
                <Alert
                    message={alertCadastro.message}
                    type={alertCadastro.type}
                    onClose={() => setAlertCadastro(null)}
                />
            )}

            {alertSync && (
                <Alert
                    message={alertSync.message}
                    type={alertSync.type}
                    onClose={() => setAlertSync(null)}
                />
            )}

            {alertEdicao && (
                <Alert
                    message={alertEdicao.message}
                    type={alertEdicao.type}
                    onClose={() => setAlertEdicao(null)}
                />
            )}


        </div>
    );
}
