import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-section">
                    <h3>NE Segurança Privada</h3>
                    <p>
                        Atuamos com excelência em controle de acesso, monitoramento e
                        segurança patrimonial, garantindo proteção e agilidade para nossos
                        clientes.
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Contato</h4>
                    <p>📞 (81) 99999-9999</p>
                    <p>📧 contato@neseguranca.com</p>
                    <p>🏢 Recife • Pernambuco</p>
                </div>

                <div className="footer-section">
                    <h4>Links Úteis</h4>
                    <ul>
                        <li><Link to="/">Início</Link></li>
                        <li><Link to="/ControleAcesso">Controle de Acesso</Link></li>
                        <li><Link to="/RegistroAcesso">Registros</Link></li>
                    </ul>
                </div>

            </div>
        </footer>
    );
}
