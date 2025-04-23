import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Modal, Nav, Tab } from 'react-bootstrap';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { baseURL_ } from '../../../config';
import axiosInstance from '../../../services/AxiosInstance';
import { ThemeContext } from '../../../context/ThemeContext';
import AssessmentsTable from '../../components/table/AssessmentsTable';
import { Logout } from '../../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { translations } from '../../pages/Locations/MinesTranslation';

const Mine = ({ language }) => {
    const { id } = useParams();
    const access = localStorage.getItem(`_dash`) || '3ts';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);
    
    // State variables for data
    const [mine, setmine] = useState();
    const [attachment, setattachment] = useState();
    const [videos, setvideos] = useState([]);
    const [incidentview, setincidentview] = useState();
    const [headers, setheaders] = useState([]);
    const [incidents, setincidents] = useState([]);
    const [picture, setpicture] = useState();
    const [location, setlocation] = useState();
    const [assessments, setassessments] = useState([]);
    const [gallery, setgallery] = useState([]);
    const [miners, setminers] = useState([]);
    const [minersHeader, setminersHeader] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [loadedTabs, setLoadedTabs] = useState(new Set());

    // Loading states for each tab
    const [loadingStates, setLoadingStates] = useState({
        basic: false,
        assessments: false,
        incidents: false,
        gallery: false,
        map: false,
        miners: false
    });

    const ignoreHeaders = [
        `I certify on my honor that I am free of any commitment to any employer and I commit myself to respect the legal and
        legal and regulatory provisions governing gold panning activities, in particular the possession, circulation and sale of gold.`,
        "Signature",
        "Company ID",
        "Last Modification",
        "Expiry Date",
        "User ID",
        "testQR"
    ];

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const setTabLoading = (tab, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [tab]: isLoading
        }));
    };

    const handleError = (err) => {
        try {
            if (err.response?.code === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.warn(err.response?.message);
            }
        } catch (e) {
            toast.error(err.message);
        }
    };

    // Separate data fetching functions for each tab
    const fetchBasicInfo = async () => {
        if (loadedTabs.has('basic')) return;
        
        setTabLoading('basic', true);
        try {
            const mineResponse = await axiosInstance.get(`${baseURL_}mines/${id}`);
            changeTitle(mineResponse.data.mine.name + ` | Minexx`);
            setpicture(`https://lh3.googleusercontent.com/d/${mineResponse.data.mine.image}=w2160?authuser=0`);
            setmine(mineResponse.data.mine);
            setLoadedTabs(prev => new Set(prev).add('basic'));
        } catch (err) {
            handleError(err);
        } finally {
            setTabLoading('basic', false);
        }
    };

// Fix the fetchGallery function to handle the new response format
const fetchGallery = async () => {
    if (loadedTabs.has('gallery')) return;
    
    setTabLoading('gallery', true);
    try {
        const [imagesResponse, videosResponse] = await Promise.all([
            axiosInstance.get(`${baseURL_}mines/images/${id}`),
            axiosInstance.get(`${baseURL_}mines/videos/${id}`)
        ]);
        
        // Handle the new response format that includes objects with id, thumbnail, and fullSize
        const imageData = imagesResponse.data.images || [];
        const videoData = videosResponse.data.videos || [];

        console.log("Images id is",imageData);
        
        // Extract image IDs or full image objects based on the response format
        const processedImages = Array.isArray(imageData) 
            ? imageData.map(img => typeof img === 'object' ? img : { id: img })
            : [];
            
        // Extract video IDs or full video objects based on the response format
        const processedVideos = Array.isArray(videoData)
            ? videoData.map(vid => typeof vid === 'object' ? vid : { id: vid })
            : [];
        
        setgallery(processedImages);
        setvideos(processedVideos);
        setLoadedTabs(prev => new Set(prev).add('gallery'));
    } catch (err) {
        handleError(err);
    } finally {
        setTabLoading('gallery', false);
    }
};

    const fetchAssessments = async () => {
        if (loadedTabs.has('assessments')) return;
        
        setTabLoading('assessments', true);
        try {
            const response = await axiosInstance.get(`${baseURL_}assessments/mine/${id}`);
            setassessments(response.data.assessments);
            setheaders(response.data.header);
            if (response.data.assessments.length > 0) {
                setlocation(response.data.assessments[0].general[4]);
            }
            setLoadedTabs(prev => new Set(prev).add('assessments'));
            setLoadedTabs(prev => new Set(prev).add('map'));
        } catch (err) {
            handleError(err);
        } finally {
            setTabLoading('assessments', false);
            setTabLoading('map', false);
        }
    };

    const fetchIncidents = async () => {
        if (loadedTabs.has('incidents')) return;
        
        setTabLoading('incidents', true);
        try {
            const response = await axiosInstance.get(`${baseURL_}incidents/mine/${id}`);
            setincidents(response.data.incidents);
            setLoadedTabs(prev => new Set(prev).add('incidents'));
        } catch (err) {
            handleError(err);
        } finally {
            setTabLoading('incidents', false);
        }
    };

    const fetchMiners = async () => {
        if (loadedTabs.has('miners') || access !== 'gold') return;
        
        setTabLoading('miners', true);
        try {
            const response = await axiosInstance.get(`${baseURL_}miners/${mine?.name}`);
            setminers(response.data.miners);
            setminersHeader(response.data.header);
            setLoadedTabs(prev => new Set(prev).add('miners'));
        } catch (err) {
            handleError(err);
        } finally {
            setTabLoading('miners', false);
        }
    };

    const showAttachment = (file, field) => {
        axiosInstance.post(`${baseURL_}image`, {
            file
        }).then(response => {
            setattachment({ image: response.data.image, field });
        }).catch(err => handleError(err));
    };

    // Handle tab selection
    const handleTabSelect = (tab) => {
        setActiveTab(tab);
        switch (tab) {
            case 'basic':
                fetchBasicInfo();
                break;
            case 'assessments':
                fetchAssessments();
                break;
            case 'incidents':
                fetchIncidents();
                break;
            case 'gallery':
                fetchGallery();
                break;
            case 'miners':
                fetchMiners();
                break;
            case 'map':
                if (!loadedTabs.has('assessments')) {
                    fetchAssessments();
                }
                break;
            default:
                break;
        }
    };

    // Initial load of basic info
    useEffect(() => {
        fetchBasicInfo();
    }, [id, language]);

    const LoadingSpinner = () => (
        <div className="card">
            <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {attachment && (
                <Modal size='lg' show={attachment} onHide={() => setattachment(null)}>
                    <Modal.Header>
                        <h3 className='modal-title'>{attachment.field}</h3>
                        <Link className='modal-dismiss' onClick={() => setattachment(null)}>x</Link>
                    </Modal.Header>
                    <Modal.Body>
                        <img alt='' className='rounded mt-4' width={'100%'} src={`https://lh3.googleusercontent.com/d/${attachment.image}=w2160?authuser=0`} />
                    </Modal.Body>
                </Modal>
            )}
            
            {incidentview && (
                <Modal size='lg' show={incidentview} onHide={() => setincidentview(null)}>
                    <Modal.Header>
                        <h3 className='modal-title'>Incident: {incidentview.id}</h3>
                        <Link className='modal-dismiss' onClick={() => setincidentview(null)}>x</Link>
                    </Modal.Header>
                    <Modal.Body>
                        <Tab.Container defaultActiveKey="incidentInfo">
                            <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                <Nav.Item as="li" className="nav-item">
                                    <Nav.Link className="nav-link px-2 px-lg-3" to="#incidentInfo" role="tab" eventKey="incidentInfo">
                                        Incident Info
                                    </Nav.Link>
                                </Nav.Item>
                                {incidentview.image && (
                                    <Nav.Item as="li" className="nav-item">
                                        <Nav.Link className="nav-link px-2 px-lg-3" to="#image" role="tab" eventKey="image">
                                            Image
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {incidentview.proof && (
                                    <Nav.Item as="li" className="nav-item">
                                        <Nav.Link className="nav-link px-2 px-lg-3" to="#proof" role="tab" eventKey="proof">
                                            Proof
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane eventKey="incidentInfo" id='incidentInfo'>
                                    <div className='card'>
                                        <div className='card-body border mt-4 rounded'>
                                            {Object.keys(incidentview)
                                                .filter(k => k !== "image" && k !== "company" && k !== "proof" && k !== "location" && incidentview[k])
                                                .map(key => (
                                                    <div className='row' key={key}>
                                                        <div className='col-4'><h5>{key.toUpperCase()}: </h5></div>
                                                        <div className='col-8'>
                                                            <p className={`font-w200 ${key === 'level' ? incidentview.level === 'low' ? 'text-primary' : incidentview.level === 'medium' ? 'text-warning' : incidentview.level === 'high' ? 'text-danger' : 'text-warning' : ''}`}>
                                                                {incidentview[key]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="image" id='image'>
                                    <img alt='' className='rounded mt-4' width={'100%'} src={`https://lh3.googleusercontent.com/d/${incidentview.image}=w2160?authuser=0`} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="proof" id='proof'>
                                    <iframe className='rounded' title={incidentview.proof} src={`https://drive.google.com/file/d/${incidentview.proof}/preview`} width="100%" height={500} allow="autoplay"></iframe>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={() => setincidentview(null)} className='btn btn-sm btn-outline-warning'>Dismiss</button>
                    </Modal.Footer>
                </Modal>
            )}

            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"/overview"}>{t("Dashboard")}</Link></li>
                    <li className="breadcrumb-item"><Link to={"/mines"}>{t("Mines")}</Link></li>
                    <li className="breadcrumb-item"><Link to={""}>{mine?.name}</Link></li>
                </ol>
            </div>

            <div className="row">
                <Tab.Container defaultActiveKey="basic" onSelect={handleTabSelect}>
                    <div className='colxl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#basic" role="tab" eventKey="basic">
                                                    {t("BasicInfo")}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#assessments" role="tab" eventKey="assessments">
                                                    {t("Assessments")}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#incidents" role="tab" eventKey="incidents">
                                                    {t("Incidents")}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#gallery" role="tab" eventKey="gallery">
                                                    {t("Gallery")}
                                                </Nav.Link>
                                            </Nav.Item>
                                            {location && (
                                                <Nav.Item as="li" className="nav-item">
                                                  <Nav.Link className="nav-link px-2 px-lg-3" to="#map" role="tab" eventKey="map">
                                                        Map
                                                    </Nav.Link>
                                                </Nav.Item>
                                            )}
                                            {access === 'gold' && (
                                                <Nav.Item as="li" className="nav-item">
                                                    <Nav.Link className="nav-link px-2 px-lg-3" to="#miners" role="tab" eventKey="miners">
                                                        Miners
                                                    </Nav.Link>
                                                </Nav.Item>
                                            )}
                                        </Nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12 col-xxl-12">
                        <Tab.Content>
                            <Tab.Pane eventKey="basic" id='basic'>
                                {loadingStates.basic ? <LoadingSpinner /> : (
                                    <div className='card'>
                                        <div className='card-body'>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <img className='rounded mb-4' style={{ width: '100%', minHeight: '400px', objectFit: 'cover' }} alt='' src={picture} />
                                                </div>
                                                <div className="col-md-8">
                                                    <h4 className="text-primary mb-2">{t("MineName")}</h4>
                                                    <Link className="text-black">{mine?.name || `--`}</Link>

                                                    <h4 className="text-primary mb-2 mt-4">{t("MineAddress")}</h4>
                                                    <Link className="text-black">{mine?.location || `--`}</Link>

                                                    <h4 className="text-primary mb-2 mt-4">{t("Mineral")}</h4>
                                                    <Link className="text-black">{mine?.mineral || `--`}</Link>

                                                    <h4 className="text-primary mb-2 mt-4">{t("Note")}</h4>
                                                    <Link className="text-black">{mine?.note || `--`}</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="assessments" id='assessments'>
                                {loadingStates.assessments ? <LoadingSpinner /> : (
                                    <AssessmentsTable headers={headers} assessments={assessments} language={language} />
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="incidents" id='incidents'>
                                {loadingStates.incidents ? <LoadingSpinner /> : (
                                    <div className="card-body pt-0 p-0" style={{ maxHeight: 700, overflow: 'auto' }}>
                                        {incidents.length === 0 ? (
                                            <div className='card'>
                                                <div className='card-body'>
                                                    <h5 className="mt-0 mb-0">{t("Noincidents")}</h5>
                                                    <p className="fs-12 font-w200">{t("Therearenoincidents")}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            incidents.map(incident => (
                                                <div onClick={() => setincidentview(incident)} className="media align-items-center border-bottom p-md-4 p-3" key={incident.id}>
                                                    <div className="media-body col-sm-6 col-6 col-xxl-5 px-0 me-4">
                                                        <h5 className="mt-0 mb-0">
                                                            <Link to={""} className="fs-18 font-w400 text-ov">
                                                                {incident.description ? incident.description : `No incident description specified.`}
                                                            </Link>
                                                        </h5>
                                                        <p className="fs-12 font-w200">{incident.detailedDescription}</p>
                                                    </div>
                                                    <div className="media-footer ms-auto col-2 px-0 d-flex align-self-center align-items-center">
                                                        <div className="text-center">
                                                            <span className="text-primary d-block fs-20">{incident.score}</span>
                                                            <span className="fs-14">Incident Score</span>
                                                        </div>
                                                    </div>
                                                    <div className="me-3">
                                                        <p className={`mb-0 ${incident.level === 'low' ? 'text-primary' : incident.level === 'medium' ? 'text-warning' : incident.level === 'high' ? 'text-danger' : 'text-warning'}`}>
                                                            Level: {incident.level}
                                                        </p>
                                                        <span className="mt-0 font-w200">{incident.date.substring(0, 10)}</span>
                                                    </div>
                                                    <div className="chart-point mt-4 text-center">
                                                        <div className="fs-13 col px-0 text-black">
                                                            {incident.level === 'low' ? (
                                                                <span className="b mx-auto"></span>
                                                            ) : incident.level === 'medium' ? (
                                                                <span className="c mx-auto"></span>
                                                            ) : incident.level === 'high' ? (
                                                                <span className="d mx-auto"></span>
                                                            ) : (
                                                                <span className="b mx-auto"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </Tab.Pane>

                           
<Tab.Pane eventKey="gallery" id='gallery'>
    {loadingStates.gallery ? <LoadingSpinner /> : (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">{t("Pictures")}</h4>
                </div>
                <div className="card-body pb-1">
                    {gallery.length === 0 ? (
                        <div>
                            <h5 className="mt-0 mb-0">{t("NoPictures")}</h5>
                            <p className="fs-12 font-w200">{t("Therearenopictures")}</p>
                        </div>
                    ) : (
                        <LightGallery
                            speed={500}
                            plugins={[lgThumbnail, lgZoom]}
                            elementClassNames="row"
                        >
                            {gallery.map((item, index) => {
                                // Handle both old format (string ID) and new format (object with properties)
                                const imageId = typeof item === 'string' ? item : item.id;
                                const thumbnailUrl = item.thumbnail || `https://lh3.googleusercontent.com/d/${imageId}=w400?authuser=0`;
                                const fullSizeUrl = item.fullSize || `https://lh3.googleusercontent.com/d/${imageId}=w2160?authuser=0`;
                                
                                return (
                                    <div data-src={fullSizeUrl} className="col-lg-3 col-md-6 mb-4" key={index}>
                                        <img 
                                            src={thumbnailUrl}
                                            style={{ width: "100%", objectFit: 'cover' }}
                                            height={300}
                                            alt={mine?.name}
                                            className='cursor-pointer rounded'
                                        />
                                    </div>
                                );
                            })}
                        </LightGallery>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">Videos</h4>
                </div>
                <div className="card-body pb-1">
                    <div className='row'>
                        {videos.length === 0 ? (
                            <div>
                                <h5 className="mt-0 mb-0">No Videos</h5>
                                <p className="fs-12 font-w200">{t("Therearenovideos")}</p>
                            </div>
                        ) : (
                            videos.map((item, index) => {
                                // Handle both old format (string ID) and new format (object with properties)
                                const videoId = typeof item === 'string' ? item : item.id;
                                const thumbnailUrl = item.thumbnailUrl || null;
                                
                                return (
                                    <div className="col-lg-3 col-md-6 mb-4" key={index}>
                                        {thumbnailUrl && (
                                            <div className="video-thumbnail-container position-relative mb-2">
                                                <img 
                                                    src={thumbnailUrl}
                                                    style={{ width: "100%", objectFit: 'cover' }}
                                                    height={180}
                                                    alt={`Video thumbnail ${index + 1}`}
                                                    className='rounded'
                                                />
                                                <div className="play-button-overlay">
                                                    <i className="fa fa-play-circle fa-3x text-white"></i>
                                                </div>
                                            </div>
                                        )}
                                        <iframe
                                            className='rounded'
                                            title={mine?.name}
                                            src={`https://drive.google.com/file/d/${videoId}/preview`}
                                            width="100%"
                                            height={thumbnailUrl ? 120 : 300}
                                            allow="autoplay, fullscreen"
                                        ></iframe>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )}
</Tab.Pane>

                            {location && (
                                <Tab.Pane id='map' eventKey='map'>
                                    {loadingStates.map ? <LoadingSpinner /> : (
                                        <div className="card event-bx" style={{ height: '80vh', width: '100%' }}>
                                            <iframe
                                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDEabEXDTK0hQXB3l7WIXM2Cg4PJJo3x_o&q=${location.split(',')[0]},${location.split(',')[1]}`}
                                                width="100%"
                                                height="100%"
                                                title={mine?.name}
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                    )}
                                </Tab.Pane>
                            )}

                            <Tab.Pane id="miners" eventKey="miners">
                                {loadingStates.miners ? <LoadingSpinner /> : (
                                    <div className="col-md-12">
                                        <div className="card">
                                            <div className="w-100 table-responsive">
                                                <div id="patientTable_basic_table" className="dataTables_wrapper">
                                                    <table
                                                        id="example5"
                                                        className="display dataTable w-100 no-footer"
                                                        role="grid"
                                                        aria-describedby="example5_info"
                                                    >
                                                        <thead>
                                                            <tr role="row">
                                                                {minersHeader
                                                                    .filter(h => h !== 'ID' && h !== 'Mine/Concession Name' && !ignoreHeaders.includes(h))
                                                                    .map(header => (
                                                                        <th
                                                                            className="sorting"
                                                                            tabIndex={0}
                                                                            aria-controls="example5"
                                                                            rowSpan={1}
                                                                            colSpan={1}
                                                                            style={{ width: 73 }}
                                                                            key={header}
                                                                        >
                                                                            {t(header)}
                                                                        </th>
                                                                    ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {miners.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={minersHeader.length}>{t("Mine does not have any miners on record.")}</td>
                                                                </tr>
                                                            ) : (
                                                                miners.map(miner => (
                                                                    <tr key={`miner-${miner[0]}`}>
                                                                        {miner
                                                                            .filter((x, y) => y !== minersHeader.indexOf('ID') &&
                                                                                y !== minersHeader.indexOf('Mine/Concession Name') &&
                                                                                !ignoreHeaders.some(header => y === minersHeader.indexOf(header))
                                                                            )
                                                                            .map((field, i) => (
                                                                                <td key={i}>
                                                                                    {field.includes(`Miners_Images`) ? (
                                                                                        <button
                                                                                            className="btn btn-sm btn-primary"
                                                                                            onClick={() => showAttachment(field, minersHeader.filter(h => h !== 'ID' && h !== 'Mine/Concession Name' && !ignoreHeaders.includes(h))[i])}
                                                                                        >
                                                                                            View
                                                                                        </button>
                                                                                    ) : field}
                                                                                </td>
                                                                            ))}
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
        </div>
    );
};

export default Mine;