import { Link } from "react-router-dom";
import "./Dropdown_Profile.css";

export default function Dropdown({ data = [], position }) {
    if (!data.length) return null;

    // Corrige a posição (centraliza)
    const style = {
        position: "absolute",
        top: "5.5rem", // ajusta conforme a altura da navbar
        left: `${position.left}px`,
        transform: "translateX(-50%)",
    };

    return (
        <div className="DropDown" style={style}>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>
                        <Link to={item.to}>{item.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
