import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Menu.css";

const Menu = () => {
  const [selected, setSelected] = useState("upload_pag");
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const pathToItem = {
      "/upload_pag": "upload_pag",
      "/agrupamento/manual": "manual",
      "/profiles": "profiles",
    };
    setSelected(pathToItem[location.pathname] || "upload_pag");
  }, [location.pathname]);

  const handleSelect = (item, path) => {
    setSelected(item);
    if (item === "agrupamento") {
      setOpenSubmenu(!openSubmenu);
    } else {
      setOpenSubmenu(false);
    }

    if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="logo">
        <span className="sadi">SADI</span>
        <span className="educacao">Educação</span>
      </div>

      <nav className="menu">
        <ul className="menu-list">
          <li
            className={`menu-item ${selected === "upload_pag" ? "selected" : ""}`}
            onClick={() => handleSelect("upload_pag", "/upload_pag")}
          >
            Upload de Vídeos
          </li>
          <li
            className={`menu-item ${selected === "agrupamento" ? "selected" : ""}`}
            onClick={() => handleSelect("agrupamento")}
          >
            Agrupamento
            {openSubmenu && (
              <ul className="submenu">
                <li
                  className={`submenu-item ${selected === "manual" ? "selected" : ""}`}
                  onClick={() => handleSelect("manual", "/agrupamento/manual")}
                >
                  Manual
                </li>
              </ul>
            )}
          </li>
          <li
            className={`menu-item ${selected === "profiles" ? "selected" : ""}`}
            onClick={() => handleSelect("profiles", "/profiles")}
          >
            Perfis
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Menu;
