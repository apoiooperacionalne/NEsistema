import { Link } from "react-router-dom";
import Logo_Seg from "../../assets/img/logo_seg.png";
import Logout_btn from "../../assets/img/logout_btn.png"
import "./Navbar.css";
import Dropdown from "../DropdownProfile/Dropdown_Profile";
import { useState, useRef } from "react";

export default function Navbar() {
    const [openProfile, setOpenProfile] = useState(false);
    const [menuType, setMenuType] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ left: 0 }); // posição dinâmica
    const navRefs = useRef({}); // referência de cada link

    const menuData = {
        recepcao: [
            { label: "Controle de acesso", to: "/ControleAcesso" },
            { label: "Registro de acesso", to: "/RegistroAcesso" },
        ],
        home: [
            { label: "Painel Geral", to: "/" },
            { label: "Configurações", to: "/config" },
        ],
        estoque: [
            { label: "Painel Geral", to: "/" },
            { label: "Configurações", to: "/config" },
        ],
    };

    function handleMouseEnter(type) {
        setMenuType(type);
        setOpenProfile(true);

        const linkElement = navRefs.current[type];
        if (linkElement) {
            const rect = linkElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            setDropdownPosition({ left: centerX });
        }
    }

    function handleMouseLeave() {
        setOpenProfile(false);
        setMenuType(null);
    }

    return (
        <nav className="navbinho" onMouseLeave={handleMouseLeave}>
            <img src={Logo_Seg} alt="" className="Nav_Logo" />
            <div className="Nav_Links" >
                <div
                    className="Nav_Link"
                    ref={(el) => (navRefs.current["home"] = el)}
                    onMouseEnter={() => handleMouseEnter("home")}
                >
                    <span>Home</span>
                </div>

                <div
                    className="Nav_Link"
                    ref={(el) => (navRefs.current["recepcao"] = el)}
                    onMouseEnter={() => handleMouseEnter("recepcao")}
                >
                    <span>Recepção</span>
                </div>
                <div
                    className="Nav_Link"
                    ref={(el) => (navRefs.current["estoque"] = el)}
                    onMouseEnter={() => handleMouseEnter("estoque")}
                >
                    <span>Estoque</span>
                </div>
            </div>
            <button className="Logout_Btn"><img src={Logout_btn} alt="" /></button>

            {openProfile && (
                <Dropdown
                    data={menuData[menuType]}
                    position={dropdownPosition}
                />
            )}
        </nav>
    );
}
