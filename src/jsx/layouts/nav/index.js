import React, { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";
import ChatBox from "../ChatBox";

const JobieNav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3, onCountryChange: parentOnCountryChange }) => {
   const [toggle, setToggle] = useState("");
   const [language, setLanguage] = useState(localStorage.getItem(`_lang`) || 'en');
   const [country, setCountry] = useState(localStorage.getItem(`_country`) || 'Rwanda');
   
   
   const onClick = (name) => setToggle(toggle === name ? "" : name);
   
   const handleLanguageChange = (newLang) => {
     setLanguage(newLang);
   };
   const handleCountryChange = (newCountry) => {
      setCountry(newCountry);
      localStorage.setItem('_country', newCountry);
      if (parentOnCountryChange) {
        parentOnCountryChange(newCountry);
      }
    };
   return (
      <Fragment>
         <NavHader />
         <SideBar 
           onClick={() => onClick2()} 
           onClick3={() => onClick3()} 
           language={language}
         />
         <Header
            onNote={() => onClick("chatbox")}
            onNotification={() => onClick("notification")}
            onProfile={() => onClick("profile")}
            toggle={toggle}
            title={title}
            onBox={() => onClick("box")}
            onClick={() => ClickToAddEvent()}
            onLanguageChange={handleLanguageChange}
            onCountryChange={handleCountryChange}
            country={country}
         />
         <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
      </Fragment>  
   );
};

export default JobieNav;