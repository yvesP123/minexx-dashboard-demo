import React, { useState, useEffect } from 'react';
import { Tab, Nav, ListGroup,ProgressBar, Container, Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { translations } from '../../pages/Locations/MinesTranslation';
import { Turtle,CheckCircle,X, XCircle } from 'lucide-react';


const Kyc = ({language}) => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const[progress, setProgress]=useState(0);
  const[totalDocuments, setTotalDocuments]=useState(0);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [missDocs, setmissDocs] = useState([]);
  const [shareholder, setShareholder] = useState([]);
  const [beneficial, setBeneficial] = useState([]);
  const [loading, setLoading] = useState(true);
  //loading
  const [basicLoading, setBasicLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [shareholderLoading,setShareholderLoading]=useState(true);
  const [BeneficialLoading,setBeneficialLoading]=useState(true);

  const platform = localStorage.getItem('_dash') || '3ts';

  const t = (key) => {
          if (!translations[language]) {
              console.warn(`Translation for language "${language}" not found`);
              return key;
          }
          return translations[language][key] || key;
      };

  useEffect(() => {
    if (id) { 
      fetchCompanyData(id);
    }
  }, [id,language]);

  const fetchCompanyData = async (id) => {
    try {
      setBasicLoading(true);
      setDocsLoading(true);
      setShareholderLoading(true);
      setBeneficialLoading(true);
      // Fetch company info
      const companyResponse = await fetch(
        `https://minexxapi-db-426415920655.us-central1.run.app/companiesnoAuth/${id}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform
          }
        }
      );
      if (!companyResponse.ok) {
        throw new Error('Network response was not ok for company details');
      }
      const companyData = await companyResponse.json();
      setCompany(companyData);
      setBasicLoading(false);
      console.log("Company Data", companyData);

      // Fetch documents
      const companyDocResponse = await fetch(
        `https://minexxapi-db-426415920655.us-central1.run.app/documentsnoAuth/${id}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform
          }
        }
      );
      if (!companyDocResponse.ok) {
        throw new Error('Network response was not ok for documents');
      }
      const companyDocData = await companyDocResponse.json();
      const { documents, progress, totalDocuments,missingDocuments } = companyDocData.documents;
      // const { missingDocs }=companyDocData..documentsmissingDocuments;
      setCompanyDocs(documents);
      setProgress(progress);
      setmissDocs(missingDocuments);
      setTotalDocuments(totalDocuments);
      setDocsLoading(false);
       console.log("Missing Documents", missingDocuments);
      console.log("Company Document Data", companyDocData);

      // Fetch shareholders
      const shareholderResponse = await fetch(
        `https://minexxapi-db-426415920655.us-central1.run.app/shareholdersnoAuth/${id}`,
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
      console.log("Shareholder Data", shareholderData.shareholders);

      // Fetch beneficial owners
      const beneficialResponse = await fetch(
        `https://minexxapi-db-426415920655.us-central1.run.app/ownersnoAuth/${id}`,
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
     // toast.error('Error fetching company data');
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
                           {company.company.number ?( <h4 className="text-primary mb-2 mt-4">{t("CompanyNumber")}</h4>):(<p></p>)}
                            <Link className="text-light" style={{ textDecoration: 'none' }}>{company.company.number}</Link>
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
                    {/* for Future Features */}
                  
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

                {/* Completed Documents Section */}
                {companyDocs.length > 0 && (
                  <div className="mt-4">
                  
                    <ListGroup>
                      {companyDocs.map((document, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          <span className="accordion-body">{document.type}<CheckCircle color="green" size={24} /></span>
                          
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
                          <span className="accordion-body">{document} <XCircle color="red" size={24} /></span>
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