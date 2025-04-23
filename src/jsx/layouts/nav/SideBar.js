import React, { useContext, useEffect, useReducer, useState } from "react";

import PerfectScrollbar from "react-perfect-scrollbar";
import {Collapse} from 'react-bootstrap';

/// Link
import { Link } from "react-router-dom";

import {RootMenu, RegulatorMenu, BIMenu, IMenu, BMenu} from './Menu';
import {useScrollPosition} from "@n8tb1t/use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";

// Add translations for menu items
const menuTranslations = {
  en: {
    Overview: "Overview",
    Exports: "Exports",
    Mines: "Mines",
    "Knowledge Base": "Knowledge Base",
    Reporting: "Reporting",
    "User Management": "User Management",
    "Dashboard Users": "Dashboard Users",
    "App Users": "App Users",
    "Trace Report": "Trace Report",
    "Total Stock Delivery": "Total Stock Delivery",
    "In-Stock Country Balance": "In-Stock Country Balance",
    "Total Purchase": "Total Purchase",
    "Get System Report Now": "Get System Report Now",
    "All Rights Reserved": "All Rights Reserved",
    "Developed with": "Developed with",
    "by": "by",
    "Supplier Sales Report": "Supplier Sale Report",
    "Supplier Delivery Trend": "Supplier Delivery Trend",
  },
  fr: {
    Overview: "Vue d'ensemble",
    Exports: "Exportations",
    Mines: "Mines",
    "Knowledge Base": "Base de connaissances",
    Reporting: "Rapports",
    "User Management": "Gestion des utilisateurs",
    "Dashboard Users": "Utilisateurs du tableau de bord",
    "App Users": "Utilisateurs de l'application",
    "Trace Report": "Rapport de traçabilité",
    "Total Stock Delivery": "Livraison totale de stock",
    "In-Stock Country Balance": "Solde du pays en stock",
    "Total Purchase": "Achat total",
    "Get System Report Now": "Obtenir le rapport système maintenant",
    "All Rights Reserved": "Tous droits réservés",
    "Developed with": "Développé avec",
    "by": "par",
    "Supplier Sales Report": "Rapport de vente de fournisseur",
    "Supplier Delivery Trend": "Tendance de livraison de fournisseur",
  }
};

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
}

const SideBar = ({ language }) => {
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
  } = useContext(ThemeContext);

  const [state, setState] = useReducer(reducer, initialState);	
  const [hideOnScroll, setHideOnScroll] = useState(true);

  let menu = [];
  const user = JSON.parse(localStorage.getItem(`_authUsr`));
  const access = localStorage.getItem(`_dash`) || '3ts';

  if (user) {
    if (user.type === 'buyer') {
      menu = BMenu;
    }
    else if (user.type === 'buyers') 
      {
        menu = BMenu;
      }
     else if (user.type === 'investor') {
      menu = IMenu;
    } else if (user.type === 'minexx') {
      menu = RootMenu;
    } else {
      menu = RegulatorMenu;
    }
  }

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    },
    [hideOnScroll]
  );

  const handleMenuActive = status => {		
    setState({ active: status });			
    if (state.active === status) {				
      setState({ active: "" });
    }   
  }

  const handleSubmenuActive = (status) => {		
    setState({ activeSubmenu: status });
    if (state.activeSubmenu === status) {
      setState({ activeSubmenu: "" });			
    }    
  }

  // Function to get translated text
  const t = (key) => menuTranslations[language][key] || key;

  // Function to get translated menu item
  const getTranslatedMenuItem = (item) => {
    const translatedTitle = t(item.title);
    return {
      ...item,
      title: translatedTitle,
      content: item.content ? item.content.map(getTranslatedMenuItem) : undefined
    };
  };

  // Translate menu items
  const translatedMenu = menu.map(getTranslatedMenuItem);

  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  return (
    <div 
      onMouseEnter={() => ChangeIconSidebar(true)}
      onMouseLeave={() => ChangeIconSidebar(false)}
      className={`deznav border-right ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <PerfectScrollbar className="deznav-scroll">
        <ul className="metismenu" id="menu">
          {translatedMenu.filter(item => user.type !== "buyer"  ? item : item.to !== "reports").map((data, index) => {
            let menuClass = data.classChange;
            if (menuClass === "menu-title") {
              return (
                <li className={menuClass} key={index}>{data.title}</li>
              );
            } else {
              return (
                <li className={`${path === data.to || window.location.pathname.includes(data.to) || state.active === data.title ? 'mm-active' : ''}`}
                  key={index}
                >
                  {data.content ? (
                    <Link to={"#"} 
                      className="has-arrow"
                      onClick={() => handleMenuActive(data.title)}
                    >								
                      {data.iconStyle}
                      <span className="nav-text">{data.title}
                        {data.update && data.update.length > 0 &&
                          <span className="badge badge-xs badge-danger ms-2">{data.update}</span>
                        }
                      </span>
                    </Link>
                  ) : (
                    <Link className={data.to === path || window.location.pathname.includes(data.to) ? 'mm-active' : ''} to={data.to}>
                      {data.iconStyle}
                      <span className="nav-text">{data.title}
                        {data.update && data.update.length > 0 &&
                          <span className="badge badge-xs badge-danger ms-2">{data.update}</span>
                        }
                      </span>
                    </Link>
                  )}
                  {data.content && (
                    <Collapse in={state.active === data.title}>
                      <ul className={`${menuClass === "mm-collapse" && data.content ? "mm-show" : ""}`}>
                        {data.content && data.content.filter(c => access === `gold` ? !["reports/daily", "reports/mtd", "reports/deliveries","reports/sale","reports/suppliertrends"].includes(c.to) : c !== null).map((subData, subIndex) => {									
                          return (
                            <li key={subIndex}
                              className={`${path === subData.to || window.location.pathname.includes(subData.to) ? "mm-active" : ""}`}
                            >
                              {subData.content ? (
                                <>
                                  <Link to={subData.to} className={subData.content ? 'has-arrow' : ''}
                                    onClick={() => handleSubmenuActive(subData.title)}
                                  >
                                    {subData.title}
                                  </Link>
                                  <Collapse in={state.activeSubmenu === subData.title}>
                                    <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                      {subData.content && subData.content.filter(c => c.to !== "/reports/daily").map((subSubData, subSubIndex) => (
                                        <li className={`${path === subSubData.to || window.location.pathname.includes(subSubData.to) ? "mm-active" : ""}`} key={subSubIndex}>
                                          <Link className={`${path === subSubData.to || window.location.pathname.includes(subSubData.to) ? "mm-active" : ""}`} to={subSubData.to}>
                                            {subSubData.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </Collapse>
                                </>
                              ) : (
                                <Link className={`${path === subData.to || window.location.pathname.includes(subData.to) ? "mm-active" : ""}`} to={subData.to}>
                                  {subData.title}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </Collapse>
                  )}
                </li>	
              );
            }
          })}          
        </ul>	
        {user.type === 'minexx' && (
          <div className="plus-box">
            <p className="fs-15 font-w500 mb-1">{t("Get System Report Now")}</p>
            <Link to={"summary-report"} className="text-white fs-26">
              <i className="las la-long-arrow-alt-right"></i>
            </Link>
          </div>
        )}
        <div className="copyright mt-4">
          <p className="fs-13 font-w200">
            <strong className="font-w400">Minexx</strong> &copy; {new Date().getFullYear()} {t("All Rights Reserved")}
          </p>
          <p>{t("Developed with")} <i className="fa fa-heart text-danger"></i> {t("by")} Minexx</p>
        </div> 
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;