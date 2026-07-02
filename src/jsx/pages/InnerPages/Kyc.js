import React, { useState, useEffect } from 'react';
import { Tab, Nav, ListGroup, ProgressBar, Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config'
import { translations } from '../../pages/Locations/MinesTranslation';
import { CheckCircle, XCircle, FileText, Info, X, Check } from 'lucide-react';

const Kyc = ({language,country}) => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [progress, setProgress] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [missDocs, setmissDocs] = useState([]);
  const [shareholder, setShareholder] = useState([]);
  const [beneficial, setBeneficial] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection states
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Loading states
  const [basicLoading, setBasicLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [shareholderLoading, setShareholderLoading] = useState(true);
  const [BeneficialLoading, setBeneficialLoading] = useState(true);

  const platform = localStorage.getItem('_dash') || '3ts';
  const user = JSON.parse(localStorage.getItem(`_authUsr`));

  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };
   const normalizedCountry = React.useMemo(() => {
        let result = country.trim();
        
        if (result.toLowerCase() === 'rwanda') {
            return '.Rwanda';
        } else {
            return result.replace(/^\.+|\.+$/g, '');
        }
      }, [country]);

  // Handle individual checkbox selection
  const handleCheckboxChange = (docId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
      setSelectAll(false);
    } else {
      setSelectedDocuments(companyDocs.map(doc => doc.id));
      setSelectAll(true);
    }
  };

  // Update selectAll state when individual checkboxes change
  useEffect(() => {
    if (selectedDocuments.length === companyDocs.length && companyDocs.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedDocuments, companyDocs]);

  const showConfirmation = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    setShowConfirmModal(false);
    
    if (confirmAction.type === 'bulk-approve') {
      try {
        const approvePromises = selectedDocuments.map(docId =>
          axiosInstance.post(`${baseURL_}approve/document/${docId}`)
        );
        await Promise.all(approvePromises);
        toast.success(`${selectedDocuments.length} document(s) approved successfully`);
        setSelectedDocuments([]);
        setSelectAll(false);
        fetchCompanyData(id);
      } catch (err) {
        console.error("Error approving documents:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to approve some documents");
      }
    } else if (confirmAction.type === 'bulk-disapprove') {
      try {
        const disapprovePromises = selectedDocuments.map(docId =>
          axiosInstance.delete(`${baseURL_}disapprove/document/${docId}`)
        );
        await Promise.all(disapprovePromises);
        toast.success(`${selectedDocuments.length} document(s) disapproved successfully`);
        setSelectedDocuments([]);
        setSelectAll(false);
        fetchCompanyData(id);
      } catch (err) {
        console.error("Error disapproving documents:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to disapprove some documents");
      }
    } else if (confirmAction.type === 'single-approve') {
      await approveDocument(confirmAction.docId);
    } else if (confirmAction.type === 'single-disapprove') {
      await handledisapprove(confirmAction.docId);
    }
    
    setConfirmAction(null);
  };

  const approveDocument = async (docId) => {
    try {
      const response = await axiosInstance.post(`${baseURL_}approve/document/${docId}`);
      toast.success("Document approved successfully");
      fetchCompanyData(id);
    } catch (err) {
      console.error(`Error approving document with ID ${docId}:`, err);
      toast.error(err.response?.data?.message || err.message || "Failed to approve Document");
    }
  };

  const handledisapprove = async (docId) => {
    try {
      const response = await axiosInstance.delete(`${baseURL_}disapprove/document/${docId}`);
      toast.success("Document disapproved successfully");
      setLoading(true);
      fetchCompanyData(id);
    } catch (err) {
      console.error(`Error disapproving document with ID ${docId}:`, err);
      toast.error(err.response?.data?.message || err.message || "Failed to disapprove Document");
    }
  };

  const handleApproveAll = () => {
    if (selectedDocuments.length === 0) {
      toast.warning("Please select at least one document to approve");
      return;
    }
    const selectedDocs = companyDocs.filter(doc => selectedDocuments.includes(doc.id));
    showConfirmation({
      type: 'bulk-approve',
      documents: selectedDocs,
      count: selectedDocuments.length
    });
  };

  const handleDisapproveAll = () => {
    if (selectedDocuments.length === 0) {
      toast.warning("Please select at least one document to disapprove");
      return;
    }
    const selectedDocs = companyDocs.filter(doc => selectedDocuments.includes(doc.id));
    showConfirmation({
      type: 'bulk-disapprove',
      documents: selectedDocs,
      count: selectedDocuments.length
    });
  };

  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    const isBulk = confirmAction.type.includes('bulk');
    const isApprove = confirmAction.type.includes('approve') && !confirmAction.type.includes('disapprove');
    const isDanger = confirmAction.type.includes('disapprove');

    return (
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className={`${isDanger ? 'bg-danger' : 'bg-success'} text-white`}>
          <Modal.Title>
            {isDanger ? <XCircle className="me-2" size={20} /> : <CheckCircle className="me-2" size={20} />}
            {isApprove ? 'approve' : 'disapprove'} {isBulk ? 'Documents' : 'Document'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-content">
            {isBulk ? (
              <>
                <p className="fs-16 mb-3">
                  You are about to <strong>{isApprove ? 'approve' : 'disapprove'}</strong>{' '}
                  <span className={`badge ${isDanger ? 'bg-danger' : 'bg-success'} fs-16`}>
                    {confirmAction.count}
                  </span>{' '}
                  document(s):
                </p>
                <div className="document-list bg-light p-3 rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {confirmAction.documents.map((doc, idx) => (
                    <div key={idx} className="d-flex align-items-start mb-2 pb-2 border-bottom">
                      <FileText className="text-primary me-2 mt-1" size={18} />
                      <div>
                        <div className="fw-bold">{doc.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="fs-16 mb-3">
                  You are about to <strong>{isApprove ? 'approve' : 'disapprove'}</strong> the following document:
                </p>
                <div className="bg-dark p-3 rounded">
                  <div className="d-flex align-items-start">
                    <FileText className="text-primary me-3 mt-1" size={24} />
                    <div>
                      <div className="fw-bold fs-16">{confirmAction.doc?.type}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className={`alert ${isDanger ? 'alert-danger' : 'alert-info'} mt-4 mb-0`}>
              <Info className="me-2" size={18} />
              {isDanger ? (
                <span>
                  <strong>Warning:</strong> This action will reject {isBulk ? 'these documents' : 'this document'} and cannot be undone.
                </span>
              ) : (
                <span>
                  This action will mark {isBulk ? 'these documents' : 'this document'} as approved.
                </span>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
          >
            <X className="me-2" size={16} />
            Cancel
          </Button>
          <Button 
            variant={isDanger ? 'danger' : 'success'}
            onClick={executeAction}
          >
            <Check className="me-2" size={16} />
            Yes, {isApprove ? 'Approve' : 'Disapprove'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  useEffect(() => {
    if (id) { 
      fetchCompanyData(id);
    }
  }, [id, language,country]);

  const fetchCompanyData = async (id) => {
    try {
      setBasicLoading(true);
      setDocsLoading(true);
      setShareholderLoading(true);
      setBeneficialLoading(true);
      
      // Fetch company info
      const companyResponse = await fetch(
        `https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/companies/country/${id}?country=${encodeURIComponent(normalizedCountry)}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform,
            'Authorization': `Bearer ${localStorage.getItem('_authRfrsh')}`
          }
        }
      );
      if (!companyResponse.ok) {
        throw new Error('Network response was not ok for company details');
      }
      const companyData = await companyResponse.json();
      setCompany(companyData);
      setBasicLoading(false);

      // Fetch documents
      const companyDocResponse = await fetch(
        `https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/documentsnoAuth/${id}?country=${encodeURIComponent(normalizedCountry)}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform,
            'Authorization': `Bearer ${localStorage.getItem('_authRfrsh')}`
          }
          
         
        }
      );
      if (!companyDocResponse.ok) {
        throw new Error('Network response was not ok for documents');
      }
      const companyDocData = await companyDocResponse.json();
      const { documents, progress, totalDocuments, missingDocuments } = companyDocData.documents;
      setCompanyDocs(documents);
      setProgress(progress);
      setmissDocs(missingDocuments);
      setTotalDocuments(totalDocuments); 
      setDocsLoading(false);

      // Fetch shareholders
      const shareholderResponse = await fetch(
        `https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/shareholdersnoAuth/${id}?country=${encodeURIComponent(normalizedCountry)}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform
          }
        }
      );
      if (!shareholderResponse.ok) {
        throw new Error('Network response was not ok for shareholders');
      }
      const shareholderData = await shareholderResponse.json();
      setShareholder(shareholderData.shareholders);
      setShareholderLoading(false);

      // Fetch beneficial owners
      const beneficialResponse = await fetch(
        `https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/ownersnoAuth/${id}?country=${encodeURIComponent(normalizedCountry)}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform
          }
        }
      );
      if (!beneficialResponse.ok) {
        throw new Error('Network response was not ok for beneficial owners');
      }
      const beneficialData = await beneficialResponse.json();
      setBeneficial(beneficialData.beneficial_owners);
      setBeneficialLoading(false)
    } catch (err) {
      console.error('Error fetching company data:', err);
      setBasicLoading(false);
      setDocsLoading(false);
      setShareholderLoading(false);
      setBeneficialLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="row">
      {renderConfirmationModal()}
      
      <div className="row page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active"><Link to={"/overview"}>{t("Dashboard")}</Link></li>
          <li className="breadcrumb-item"><Link to={"/mines"}>{t("Mines")}</Link></li>
          <li className="breadcrumb-item"><Link to={""}>{t("Kyc")}</Link></li>
        </ol>
      </div>

      <Tab.Container defaultActiveKey="basic">
        <div className='col-xl-12'>
          <div className="card">
            <div className="card-body px-4 py-3 py-md-2">
              <div className="row align-items-center">
                <div className="col-sm-12 col-md-7">
                  <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                    <Nav.Item as="li" className="nav-item">
                      <Nav.Link className="nav-link px-2 px-lg-3" to="#basic" role="tab" eventKey="basic">
                        {t('BasicInfo')}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li" className="nav-item">
                      <Nav.Link className="nav-link px-2 px-lg-3" to="#documents" role="tab" eventKey="documents">
                        {t('Documents')}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li" className="nav-item">
                      <Nav.Link className="nav-link px-2 px-lg-3" to="#shareholders" role="tab" eventKey="shareholders">
                        {t('Shareholders')}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li" className="nav-item">
                      <Nav.Link className="nav-link px-2 px-lg-3" to="#beneficialOwners" role="tab" eventKey="beneficialOwners">
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
            <Tab.Pane eventKey="basic" id="basic">
              <div className="card">
                <div className="card-body">
                  {basicLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="row">
                      <div className="col-lg-6">
                        {company && company.company && (
                          <>
                            <h4 className="text-primary mb-2 mt-4">{t("CompanyName")}</h4>
                            <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.name}</Link>
                            <h4 className="text-primary mb-2 mt-4">{t("CompanyAddress")}</h4>
                            <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.address}</Link>
                            <h4 className="text-primary mb-2 mt-4">{t("CompanyCountry")}</h4>
                            <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.country}</Link>
                            {company.company.number && (
                              <>
                                <h4 className="text-primary mb-2 mt-4">{t("CompanyNumber")}</h4>
                                <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.number}</Link>
                              </>
                            )}
                            <h4 className="text-primary mb-2 mt-4">{t("CompanyType")}</h4>
                            <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.type}</Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="documents" id="documents">
              <div className="card">
                <div className="card-body">
                  {docsLoading ? (
                    <LoadingSpinner />
                  ) : companyDocs.length > 0 || missDocs.length > 0 ? (
                    <>
                      <Container fluid className="mt-3">
                        <Row className="align-items-center">
                          <Col xs="auto">
                            <div className="d-flex align-items-baseline">
                              <span style={{fontSize: '2.5rem'}} className="fw-bold">KYC Progress: </span>
                              <span style={{fontSize: '2.5rem'}} className="text-primary fw-bold">  {progress}</span>
                              <span style={{fontSize: '1.8rem'}} className="ms-1">%</span>
                            </div>
                          </Col>
                          <Col>
                            <ProgressBar 
                              now={progress} 
                              variant="primary" 
                              style={{ height: '1.5rem' }} 
                            />
                          </Col>
                        </Row>
                      </Container>

                      {/* Bulk Actions - Only show if there are unapproved documents */}
                      {user.type === 'investor' && user.email === "info@minexx.co" && companyDocs.length > 0 && companyDocs.some(doc => doc.status !== 'Approved') && (
                        <div className="d-flex justify-content-between align-items-center mt-4 mb-3 p-3 bg-dark rounded">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="form-check-input"
                              id="selectAllDocs"
                            />
                            <label className="form-check-label  fw-bold" htmlFor="selectAllDocs">
                              Select All Documents
                            </label>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              onClick={handleApproveAll}
                              className="btn btn-success btn-sm px-3"
                              disabled={selectedDocuments.length === 0}
                            >
                              <Check className="me-1" size={16} />
                              Approve ({selectedDocuments.length})
                            </button>
                            <button
                              onClick={handleDisapproveAll}
                              className="btn btn-danger btn-sm px-3"
                              disabled={selectedDocuments.length === 0}
                            >
                              <X className="me-1" size={16} />
                              Disapprove ({selectedDocuments.length})
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Completed Documents Section */}
                      {companyDocs.length > 0 && (
                        <div className="mt-4">
                          <ListGroup>
                            {companyDocs.map((document, index) => (
                              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  {user.type === 'investor' && user.email === "info@minexx.co" && (
                                    <div className="form-check me-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedDocuments.includes(document.id)}
                                        onChange={() => handleCheckboxChange(document.id)}
                                        className="form-check-input"
                                        id={`doc-${document.id}`}
                                      />
                                    </div>
                                  )}
                                  <span className="accordion-body">
                                    {document.type}
                                    <CheckCircle color="green" size={24} className="ms-2" />
                                  </span>
                                </div>
                                
                                <div className="mt-3 d-flex gap-2">
                                  <a
                                    target="_blank"
                                    className="btn btn-info"
                                    href={`https://drive.google.com/file/d/${document.file}/preview`}
                                    rel="noreferrer"
                                  >
                                    {t("View")}
                                  </a>
                                  <a
                                    target="_blank"
                                    className="btn btn-primary"
                                    href={`https://drive.usercontent.google.com/download?id=${document.file}&export=download&authuser=0`}
                                    rel="noreferrer"
                                  >
                                    {t("Download")}
                                  </a>
                                  {user.type === 'investor' && user.email === "info@minexx.co" && (
                                    document.status !== 'Approved' ? (
                                      <>
                                        <button
                                          onClick={() => showConfirmation({
                                            type: 'single-approve',
                                            doc: document,
                                            docId: document.id
                                          })}
                                          className="btn btn-secondary"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => showConfirmation({
                                            type: 'single-disapprove',
                                            doc: document,
                                            docId: document.id
                                          })}
                                          className="btn btn-danger"
                                        >
                                          Disapprove
                                        </button>
                                      </>
                                    ) : (
                                      <span className="btn btn-success text-white disabled">Approved</span>  
                                    )
                                  )}
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}

                      {/* Missing Documents Section */}
                      {missDocs.length > 0 && (
                        <div className="mt-4">
                          <ListGroup>
                            {missDocs.map((document, index) => (
                              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <span className="accordion-body">
                                  {document} 
                                  <XCircle color="red" size={24} className="ms-2" />
                                </span>
                                <div className="mt-3 d-flex gap-2">
                                  <a
                                    target="_blank"
                                    className="btn btn-danger"
                                  >
                                    Missing
                                  </a>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-light">{t("NoDocuments")}</p>
                  )}
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="shareholders" id="shareholders">
              <div className="card">
                <div className="card-body">
                  {shareholderLoading ? (
                    <LoadingSpinner />
                  ) : shareholder.length > 0 ? (
                    <div>
                      {shareholder.map((document, index) => (
                        <div key={index}>
                          <h4 className="text-primary mb-2 mt-4">{t("Name")}: {document.name}</h4>
                          <h4 className="text-light mb-2 mt-4">{t("PercentageOwned")}: {document.percent}%</h4>
                          <h4 className="text-light mb-2 mt-4">{t("Nationality")}: {document.nationality}</h4>
                          <h4 className="text-light mb-2 mt-4">{t("Address")}: {document.address}</h4>
                          <iframe
                            title={document.name}
                            src={`https://drive.google.com/file/d/${document.nationalID}/preview`}
                            width="100%"
                            height="500"
                            allow="autoplay"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light">{t("NoShareholders")}</p>
                  )}
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="beneficialOwners" id="beneficialOwners">
              <div className="card">
                <div className="card-body">
                  {BeneficialLoading ? (
                    <LoadingSpinner />
                  ) : beneficial.length > 0 ? (
                    <div>
                      {beneficial.map((owner, index) => (
                        <div key={index}>
                          <h4 className="text-primary mb-2 mt-4">{t("Name")}: {owner.name}</h4>
                          <h4 className="text-light mb-2 mt-4">{t("PercentageOwned")}: {owner.percent}%</h4>
                          <h4 className="text-light mb-2 mt-4">{t("Nationality")}: {owner.nationality}</h4>
                          <h4 className="text-light mb-2 mt-4">{t("Address")}: {owner.address}</h4>
                          <iframe
                            title={owner.name}
                            src={`https://drive.google.com/file/d/${owner.nationalID}/preview`}
                            width="100%"
                            height="500"
                            allow="autoplay"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light">{t("NoBeneficialOwners")}</p>
                  )}
                </div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </div>
      </Tab.Container>
    </div>
  );
};

export default Kyc;