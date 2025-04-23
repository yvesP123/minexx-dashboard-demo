import React, { useContext, useState } from "react";

/// React router dom
import {  Routes, Route, Outlet, Router  } from "react-router-dom";

/// Css
//import "swiper/css";
import "./index.css";
import "./chart.css";
import "./step.css";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import ScrollToTop from './layouts/ScrollToTop';
/// Dashboard
import Home from './components/Dashboard/Home';
import EventList from './components/Dashboard/EventList';
import EventPage from './components/Dashboard/EventPage';
import Analytics from './components/Dashboard/Analytics';
import Incidents from './pages/Events/Incidents';
import Reviews from './components/Dashboard/Reviews';
import DashboardCustomers from './components/Dashboard/Customers';
import Task from './components/Dashboard/Task';

//Demo
import DashboardLight from './components/Dashboard/demo/DashboardLight';
import Theme1 from './components/Dashboard/demo/Theme1';
import Theme2 from './components/Dashboard/demo/Theme2';
//import Theme3 from './components/Dashboard/demo/Theme3';
import Theme4 from './components/Dashboard/demo/Theme4';
import Theme5 from './components/Dashboard/demo/Theme5';
import Theme6 from './components/Dashboard/demo/Theme6';


//Content
import Content from './components/Cms/Content';
import Menu from './components/Cms/Menu';
import EmailTemplate from './components/Cms/EmailTemplate';
import Blog from './components/Cms/Blog';


//Ticket
import CreateTicket from './components/Ticket/CreateTicket';
import AllTicket from './components/Ticket/AllTicket';

//Customers
import Chat from './components/Customers/Chat';
import Users from './components/Customers/Users';

/// App
import AppProfile from "./components/AppsMenu/AppProfile/AppProfile";
import PostDetails from "./components/AppsMenu/AppProfile/PostDetails";
import EditProfile from "./components/AppsMenu/AppProfile/EditProfile";
import Compose from "./components/AppsMenu/Email/Compose/Compose";
import Inbox from "./components/AppsMenu/Email/Inbox/Inbox";
import Read from "./components/AppsMenu/Email/Read/Read";
import Calendar from "./components/AppsMenu/Calendar/Calendar";

/// Product List
import ProductGrid from "./components/AppsMenu/Shop/ProductGrid/ProductGrid";
import ProductList from "./components/AppsMenu/Shop/ProductList/ProductList";
import ProductDetail from "./components/AppsMenu/Shop/ProductGrid/ProductDetail";
import Checkout from "./components/AppsMenu/Shop/Checkout/Checkout";
import Invoice from "./components/AppsMenu/Shop/Invoice/Invoice";
import ProductOrder from "./components/AppsMenu/Shop/ProductOrder";
import Customers from "./components/AppsMenu/Shop/Customers/Customers";

/// Charts
import SparklineChart from "./components/charts/Sparkline";
import ChartJs from "./components/charts/Chartjs";
//import Chartist from "./components/charts/chartist";
import RechartJs from "./components/charts/rechart";
import ApexChart from "./components/charts/apexcharts";

/// Bootstrap
import UiAlert from "./components/bootstrap/Alert";
import UiAccordion from "./components/bootstrap/Accordion";
import UiBadge from "./components/bootstrap/Badge";
import UiButton from "./components/bootstrap/Button";
import UiModal from "./components/bootstrap/Modal";
import UiButtonGroup from "./components/bootstrap/ButtonGroup";
import UiListGroup from "./components/bootstrap/ListGroup";
import UiCards from "./components/bootstrap/Cards";
import UiCarousel from "./components/bootstrap/Carousel";
import UiDropDown from "./components/bootstrap/DropDown";
import UiPopOver from "./components/bootstrap/PopOver";
import UiProgressBar from "./components/bootstrap/ProgressBar";
import UiTab from "./components/bootstrap/Tab";
import UiPagination from "./components/bootstrap/Pagination";
import UiGrid from "./components/bootstrap/Grid";
import UiTypography from "./components/bootstrap/Typography";

/// Plugins
import Select2 from "./components/PluginsMenu/Select2/Select2";
//import Nestable from "./components/PluginsMenu/Nestable/Nestable";
//import MainNouiSlider from "./components/PluginsMenu/NouiSlider/MainNouiSlider";
import MainSweetAlert from "./components/PluginsMenu/SweetAlert/SweetAlert";
import Toastr from "./components/PluginsMenu/Toastr/Toastr";
import JqvMap from "./components/PluginsMenu/JqvMap/JqvMap";
import Lightgallery from "./components/PluginsMenu/Lightgallery/Lightgallery";

//Redux
import Todo from "./pages/Todo";
//import ReduxForm from "./components/Forms/ReduxForm/ReduxForm";
//import WizardForm from "./components/Forms/ReduxWizard/Index";

/// Widget
import Widget from "./pages/Widget";

/// Table
import SortingTable from "./components/table/SortingTable/SortingTable";
import FilteringTable from "./components/table/FilteringTable/FilteringTable";
import DataTable from "./components/table/DataTable";
import BootstrapTable from "./components/table/BootstrapTable";

/// Form
import Element from "./components/Forms/Element/Element";
import Wizard from "./components/Forms/Wizard/Wizard";
import CkEditor from "./components/Forms/CkEditor/CkEditor";
import Pickers from "./components/Forms/Pickers/Pickers";
import FormValidation from "./components/Forms/FormValidation/FormValidation";

/// Pages
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import KycLogin from "./pages/KycLogin";
import ForgotPassword from "./pages/ForgotPassword";
import LockScreen from "./pages/LockScreen";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import { ThemeContext } from "../context/ThemeContext";
import Reports from "./pages/Reports";
import MineSites from "./pages/Locations/MineSites";
import Compliance from "./pages/Compliance";
import Locations from "./pages/Locations/Index";
import Assessments from "./pages/Events/Assessments";
import Villages from "./pages/Locations/Villages";
import DDSystems from "./pages/DDSystems"
import Miners from "./pages/Locations/Miners";
import SummaryReport from "./pages/SummaryReport";
import Company from "./pages/Company";
import Exports from "./pages/Events/Exports";
import Tracking from "./pages/Events/Tracking";
import ProductionSummary from "./pages/ProductionSummary";
import Companies from "./pages/Companies";
import Suppliers from "./pages/Suppliers";
import Mines from "./pages/Locations/Mines";
import Kyc from "./pages/InnerPages/Kyc";
import Export from "./pages/InnerPages/Export";
import ExportA from "./pages/InnerPages/ExportA";
import Mine from "./pages/InnerPages/Mine";
import Assessment from "./pages/InnerPages/Assessment";

const Markup = (props) => {
  const { menuToggle } = useContext(ThemeContext);
  const [language, setLanguage] = useState(localStorage.getItem('_lang') || 'en');
  const [country, setCountry] = useState(localStorage.getItem('_country') || 'Rwanda');

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('_lang', newLang); 
  };
  const changeCountry = (newCountry) => {
    setCountry(newCountry);
    localStorage.setItem('_country', newCountry);
  };
  const allroutes = [
    /// Dashboard
    { url: "/", component:<Home key={language} language={language}  country={country}/>  },
    { url: 'overview', component: <Home key={language} language={language}  country={country} /> },
    { url: 'companies', component: <Companies/> },
    { url: 'company/:id', component: <Company key={language} language={language}/> },
    { url: 'mines/:id', component: <Mine key={language} language={language}/> },
    { url: 'Kyc/:id', component: <Kyc key={language} language={language} /> },
    { url: 'users', component: <Users/> },
	  { url: 'incidents', component: <Incidents/> },
	  { url: 'exports', component: <Exports key={language} language={language} country={country}/> },
    { url: 'time-tracking', component: <Tracking key={language} language={language} country={country}/> },
	  { url: 'exports/:id', component: <Export key={language} language={language} country={country}/> },
    { url: 'exportsauth/:id', component: <ExportA/> },
	  { url: 'mines', component: <Mines key={language} language={language} country={country}/> },
	  { url: 'mine-sites', component: <MineSites/> },
	  { url: 'compliance', component: <Compliance/> },
	  { url: 'locations', component: <Locations/> },
	  { url: 'assessment', component: <Assessment key={language} language={language} country={country}/> },
	  { url: 'assessments', component: <Assessments/> },
	  { url: 'villages', component: <Villages/> },
	  { url: 'miners', component: <Miners/> },
	  { url: 'suppliers', component: <Suppliers/> },
	  { url: 'knowledge', component: <DDSystems key={language} language={language}/> },
    { url: 'dashboard-light', component: <DashboardLight/> },
	  { url: 'event-list', component: <EventList/> },
	  { url: 'event', component: <EventPage/> },
	  { url: 'analytics', component: <Analytics/> },
	  { url: 'reviews', component: <Reviews/> },
	  { url: 'customers', component: <DashboardCustomers/> },
	  { url: 'task', component: <Task/> },
	  { url: 'summary-report', component: <SummaryReport/> },
    
    //Demo
	  { url: 'dark-sidebar', component: <Theme1/> },
	  { url: 'header-secondary', component: <Theme2/> },
	  { url: 'horizontal-sidebar', component: <Theme4/> },
	  { url: 'header-style', component: <Theme5/> },
	  { url: 'mini-sidebar', component: <Theme6/> },
    
    //Content
	  { url: 'content', component: <Content/> },
	  { url: 'menu-1', component: <Menu/> },
	  { url: 'email-template', component: <EmailTemplate/> },
	  { url: 'blog', component: <Blog/> },

    //Ticket
	  { url: 'create-ticket', component: <CreateTicket/> },
	  { url: 'all-ticket', component: <AllTicket/> },

    //Customers
    {url:'chat', component:<Chat/> },
    {url:'users/:platform', component:<Users/> },

    //Reports
    {url:'reports/:type', component:<Reports key={language} language={language} country={country}/> },


    /// Apps
    { url: "profile", component: <AppProfile /> },
    { url: "post-details", component: <PostDetails/> },
    { url: "edit-profile", component: <EditProfile/> },
    { url: "email-compose", component: <Compose /> },
    { url: "email-inbox", component: <Inbox/>},
    { url: "email-read", component: <Read/> },
    { url: "app-calender", component: <Calendar /> },

    /// Chart
    { url: "chart-sparkline", component: <SparklineChart /> },
    { url: "chart-chartjs", component: <ChartJs /> },
    //{ url: "chart-chartist", component: Chartist },
    { url: "chart-apexchart", component: <ApexChart /> },
    { url: "chart-rechart", component: <RechartJs /> },

    /// Bootstrap
    { url: "ui-alert", component: <UiAlert /> },
    { url: "ui-badge", component: <UiBadge/> },
    { url: "ui-button", component: <UiButton /> },
    { url: "ui-modal", component: <UiModal /> },
    { url: "ui-button-group", component: <UiButtonGroup /> },
    { url: "ui-accordion", component: <UiAccordion/> },
    { url: "ui-list-group", component: <UiListGroup /> },
    //{ url: "ui-media-object", component: UiMediaObject },
    { url: "ui-card", component: <UiCards/> },
    { url: "ui-carousel", component: <UiCarousel/> },
    { url: "ui-dropdown", component: <UiDropDown/> },
    { url: "ui-popover", component: <UiPopOver /> },
    { url: "ui-progressbar", component: <UiProgressBar /> },
    { url: "ui-tab", component: <UiTab /> },
    { url: "ui-pagination", component: <UiPagination /> },
    { url: "ui-typography", component: <UiTypography/> },
    { url: "ui-grid", component: <UiGrid/> },

    /// Plugin
    { url: "uc-select2", component: <Select2 /> },
    //{ url: "uc-nestable", component: Nestable },
    //{ url: "uc-noui-slider", component: <MainNouiSlider/> },
    { url: "uc-sweetalert", component: <MainSweetAlert/> },
    { url: "uc-toastr", component: <Toastr/> },
    { url: "map-jqvmap", component: <JqvMap/> },
    { url: "uc-lightgallery", component: <Lightgallery/> },

	///Redux
	{ url: "todo", component: <Todo/> },
	//{ url: "redux-form", component: ReduxForm },
    //{ url: "redux-wizard", component: WizardForm },
	
    /// Widget
    { url: "widget-basic", component: <Widget/> },

    /// Shop
    { url: "ecom-product-grid", component: <ProductGrid /> },
    { url: "ecom-product-list", component: <ProductList/> },
    { url: "ecom-product-detail", component: <ProductDetail/> },
    { url: "ecom-product-order", component: <ProductOrder/> },
    { url: "ecom-checkout", component: <Checkout /> },
    { url: "ecom-invoice", component: <Invoice /> },
    { url: "ecom-product-detail", component: <ProductDetail/> },
    { url: "ecom-customers", component: <Customers/> },

    /// Form
    { url: "form-element", component: <Element/> },
    { url: "form-wizard", component: <Wizard/> },
    { url: "form-ckeditor", component: <CkEditor /> },
    { url: "form-pickers", component: <Pickers /> },
    { url: "form-validation", component: <FormValidation /> },

    /// table
	{ url: 'table-filtering', component: <FilteringTable /> },
    { url: 'table-sorting', component: <SortingTable /> },
    { url: "table-datatable-basic", component: <DataTable /> },
    { url: "table-bootstrap-basic", component: <BootstrapTable /> },

    /// pages
    { url: "page-register", component: <Registration /> },
    { url: "page-lock-screen", component: <LockScreen /> },
    { url: "page-login", component: <Login /> },
    { url: "page-forgot-password", component: <ForgotPassword /> },
    { url: "page-error-400", component: <Error400/> },
    { url: "page-error-403", component: <Error403/> },
    { url: "page-error-404", component: <Error404 /> },
    { url: "page-error-500", component: <Error500/> },
    { url: "page-error-503", component: <Error503/> },
  ];
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  let pagePath = path.split("-").includes("page");
  return (
    <>
      {/* <div
        id={`${!pagePath ? "main-wrapper" : ""}`}
        className={`${!pagePath ? "show" : "mh100vh"}  ${
          menuToggle ? "menu-toggle" : ""
        }`}
      >
        {!pagePath && <Nav />}

        <div className={`${!pagePath ? "content-body" : ""}`}>
          <div
            className={`${!pagePath ? "container-fluid" : ""}`}
            style={{ minHeight: window.screen.height - 60 }}
          >
            <Switch>
              {routes.map((data, i) => (
                <Route
                  key={i}
                  exact
                  path={`/${data.url}`}
                  component={data.component}
                />
              ))}
            </Switch>
          </div>
        </div>
        {!pagePath && <Footer />}
      </div> */}
      <Routes>
          {/* <Route path='page-lock-screen' element= {<LockScreen />} />
          <Route path='page-error-400' element={<Error400/>} />
          <Route path='page-error-403' element={<Error403/>} /> */}
          {/* <Route path='*' element={<Error404/>} /> */}
          {/* <Route path='page-error-500' element={<Error500/>} />
          <Route path='page-error-503' element={<Error503/>} /> */}
          <Route path="/"  element={<MainLayout language={language} onLanguageChange={changeLanguage}   onCountryChange={changeCountry} />} > 
              {allroutes.map((data, i) => (
                <Route
                  key={i}
                  exact
                  path={`${data.url}`}
                  element={React.cloneElement(data.component, { 
                    language: language,
                    country: country 
                  })}

                >
                </Route>
              ))}
          </Route>
      </Routes>
      {/* <Setting /> */}
	  <ScrollToTop />
    </>
  );
};

function MainLayout({ language, onLanguageChange, country, onCountryChange }){
  const { menuToggle, sidebariconHover } = useContext(ThemeContext);
  return (
    <div id="main-wrapper" className={`show ${sidebariconHover ? "iconhover-toggle": ""} ${ menuToggle ? "menu-toggle" : ""}`}>  
      <Nav 
        language={language}
        onLanguageChange={onLanguageChange}
        country={country}
        onCountryChange={onCountryChange}
      />
      <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
          <div className="container-fluid">
            <Outlet />                
          </div>
      </div>
      <Footer />
    </div>
  )
}

export default Markup;