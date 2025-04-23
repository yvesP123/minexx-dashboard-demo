import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Modal, Nav, Tab } from 'react-bootstrap';
import { baseURL_ } from '../../config';
import ComplianceTable from '../components/table/ComplianceTable';
import { toast } from 'react-toastify';
import { ThemeContext } from '../../context/ThemeContext';
import { Logout } from '../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../services/AxiosInstance';
import { translations } from './Companytranslation';

const Company = ({ language }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);
    
    // Separate loading states for each section
    const [loadingStates, setLoadingStates] = useState({
        basic: true,
        documents: true,
        shareholders: true,
        beneficialOwners: true
    });
    
    // Data states
    const [company, setCompany] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [shareholders, setShareholders] = useState([]);
    const [beneficialOwners, setBeneficialOwners] = useState([]);
    const [shareholderID, setShareholderID] = useState(null);

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const handleError = (err) => {
        try {
            if (err.response?.status === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.warn(err.response?.data?.message || 'An error occurred');
            }
        } catch (e) {
            toast.error(err.message || 'An unexpected error occurred');
        }
    };

    // Separate fetch functions for each data type
    const fetchCompanyDetails = async () => {
        try {
            const response = await axiosInstance.get(`companies/${id}`);
            setCompany(response.data.company);
            changeTitle(response.data.company.name);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, basic: false }));
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await axiosInstance.get(`${baseURL_}documentsnoAuth/${id}`);
            setDocuments(response.data.documents.documents);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, documents: false }));
        }
    };

    const fetchShareholders = async () => {
        try {
            const response = await axiosInstance.get(`${baseURL_}shareholders/${id}`);
            setShareholders(response.data.shareholders);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, shareholders: false }));
        }
    };

    const fetchBeneficialOwners = async () => {
        try {
            const response = await axiosInstance.get(`${baseURL_}owners/${id}`);
            setBeneficialOwners(response.data.beneficial_owners);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, beneficialOwners: false }));
        }
    };

    useEffect(() => {
        fetchCompanyDetails();
        fetchDocuments();
        fetchShareholders();
        fetchBeneficialOwners();
    }, [id, language]);

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    const renderPersonCard = (person, type, index) => (
        <div className='col-md-4' key={`${type}${index}`}>
            <div className='card'>
                <div className='card-body'>
                    <h5 className='text-primary'>{person?.name}</h5>
                    <span>{t('Nationality')}: {person?.nationality}</span><br/>
                    <span>{t('PercentageOwned')}: {person?.percent}%</span><br/>
                    <span>{t('Address')}: {person?.address || '--'}</span><br/>
                    {person.nationalID && (
                        <Link 
                            to="" 
                            className='btn btn-sm btn-primary mt-3' 
                            onClick={() => setShareholderID(person)}
                        >
                            {t('View')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Modal show={!!shareholderID} onHide={() => setShareholderID(null)}>
                <Modal.Header closeButton>
                    <h3>{shareholderID?.name || '--'}</h3>
                </Modal.Header>
                <Modal.Body>
                    <iframe 
                        title={shareholderID?.name || '--'} 
                        src={`https://drive.google.com/file/d/${shareholderID?.nationalID || ''}/preview`} 
                        width="100%" 
                        height="600" 
                        allow="autoplay"
                    />
                </Modal.Body>
            </Modal>

            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to="/overview">{t('Dashboard')}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/exports">{t('Exports')}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="">{company?.name || 'Company Details'}</Link>
                    </li>
                </ol>
            </div>

            <div className="row">
                <Tab.Container defaultActiveKey="basic">
                    <div className='col-xl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="basic">
                                                    {t('BasicInfo')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="documents">
                                                    {t('Documents')} <span className='badge badge-primary'>{documents.length}</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="shareholders">
                                                    {t('Shareholders')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="owners">
                                                    {t('BeneficialOwners')}
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-12 col-xxl-12">
                        <Tab.Content>
                            <Tab.Pane eventKey="basic">
                                {loadingStates.basic ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className='card'>
                                        <div className='card-body'>
                                            <h4 className="text-primary mb-2">{t('CompanyName')}</h4>
                                            <p className="text-black">{company?.name || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyAddress')}</h4>
                                            <p className="text-black">{company?.address || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyCountry')}</h4>
                                            <p className="text-black">{company?.country || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyNumber')}</h4>
                                            <p className="text-black">{company?.number || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyType')}</h4>
                                            <p className="text-black">{company?.type || '--'}</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="documents">
                                {loadingStates.documents ? (
                                    <LoadingSpinner />
                                ) : (
                                    <ComplianceTable documents={documents} language={language} />
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="shareholders">
                                {loadingStates.shareholders ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="row">
                                        {shareholders.length === 0 ? (
                                            <div className='col-12'>
                                                <div className='card'>
                                                    <div className='card-body text-center'>
                                                        <p>{t('NoShare')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            shareholders.map((shareholder, i) => 
                                                renderPersonCard(shareholder, 'sh', i)
                                            )
                                        )}
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="owners">
                                {loadingStates.beneficialOwners ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="row">
                                        {beneficialOwners.length === 0 ? (
                                            <div className='col-12'>
                                                <div className='card'>
                                                    <div className='card-body text-center'>
                                                        <p>{t('Nobeneficial')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            beneficialOwners.map((owner, i) => 
                                                renderPersonCard(owner, 'own', i)
                                            )
                                        )}
                                    </div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
        </>
    );
};

export default Company;