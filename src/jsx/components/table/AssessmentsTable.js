import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Link, useNavigate } from "react-router-dom";
import { Accordion, Modal } from "react-bootstrap";
import { translations } from '../../pages/Locations/MinesTranslation';

const AssessmentsTable = ({ assessments, headers,language}) => {
  const [data, setData] = useState(
    document.querySelectorAll("#allreview tbody tr")
  );
  const navigate = useNavigate()
  localStorage.removeItem('assessment') 
  const sort = 6;
  const activePag = useRef(0);
  const midpoint = Math.ceil(headers.length / 2);
  const header1 = headers.slice(0, midpoint);
  const header2 = headers.slice(-midpoint);

  const midpoint1 = Math.ceil(header1.length / 2);
  const firstHalf = header1.slice(0, midpoint1);
  const secondHalf = header1.slice(-midpoint1);

  const midpoint2 = Math.ceil(header2.length / 2);
  const thirdHalf = header2.slice(0, midpoint2);
  const fourthHalf = header2.slice(-midpoint2);

  const [assessment, setassessment] = useState()
  const [test, settest] = useState(0);

  // Active data
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };
  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };


  const viewAssessment = (item)=>{
    localStorage.setItem('assessment', JSON.stringify(item))
    navigate('/assessment')
  }
  
  // use effect
  useEffect(() => {
    setData(document.querySelectorAll("#allreview tbody tr"));
   // chackboxFun();
  }, [ assessments,language ]);


  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    settest(i);
  };

  return (
    <div id="All" className="tab-pane">
      <Modal size="xl" show={assessment} onEscapeKeyDown={()=>setassessment(null)}>
        <Modal.Header>
            <h3>{assessment ? assessment[25] : `--`}</h3>
            <Link onClick={()=>setassessment(null)} className="modal-dismiss">x</Link>
        </Modal.Header>
        <Modal.Body>
        <div className="row">
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { firstHalf.map((header, i)=>{
              return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { secondHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { thirdHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { fourthHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<></>) : (<></>)
              })
              }
            </Accordion>
          </div>
        </div>
        </Modal.Body>
        <Modal.Footer>
        <button onClick={()=>setassessment(null)} className="btn btn-sm btn-warning">Close</button>
        </Modal.Footer>
      </Modal>
      <div className="table-responsive table-hover fs-14">
        <div id="allreview" className="dataTables_wrapper no-footer ">
          <table
            id="example2"
            className="table mb-4 dataTablesCard  fs-14 dataTable no-footer"
            role="grid"
            aria-describedby="example2_info"
          >
            <thead>
              <tr role="row">
                <th
                  className="sorting"
                  tabIndex="0" aria-controls="example5" rowSpan="1" colSpan="1"
                  aria-label="Customer: activate to sort column ascending"
                >
                  {t("AssessmentStartDate")}
                </th>
                <th
                  className="sorting"
                  tabIndex="0" aria-controls="example5" rowSpan="1" colSpan="1"
                  aria-label="Customer: activate to sort column ascending"
                >
                  {t("AssessmentEndDate")}
                </th>
                <th
                  className="d-none d-lg-table-cell sorting" tabIndex="0" aria-controls="example5"
                  rowSpan="1" colSpan="1" aria-label="Event NAME: activate to sort column ascending"
                >
                  {t("AssessmentType")}
                </th>
                <th
                  className="sorting" 
                >
                  {("Action")}
                </th>
              </tr>
            </thead>

            <tbody>
              {assessments.length === 0 ? <tr>
                <td className="pa-5 text-center font-w200" colSpan={5}>{t("There are no assessments to display.")}</td>
              </tr>
              : assessments.map( (doc, i) => <tr key={i} role="row" className="odd">
                <td>
                  <div className="media align-items-center">
                    <span>{ doc.general[22] }</span>
                  </div>
                </td>
                <td>
                  <div className="media align-items-center">
                    <span>{ doc.general[23] }</span>
                  </div>
                </td>
                <td className="d-none d-lg-table-cell">{doc.general[24]}</td>
                <td onClick={()=>viewAssessment(doc)} >
                  <div className="d-flex">
                    <Link to="" title="View Assessment Report" className="btn btn-primary light btn-sm px-4"><FontAwesomeIcon icon={icon({ name: 'eye' })} /></Link>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>

          <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
            <div className="dataTables_info">
              {t("Showing")} {activePag.current * sort + 1} {t("To")}{" "}
              {data.length > (activePag.current + 1) * sort
                ? (activePag.current + 1) * sort
                : data.length}{" "}
              {t("Of")} {data.length} {t("Entries")}
            </div>
            <div
              className="dataTables_paginate paging_simple_numbers"
              id="example2_paginate"
            >
              <Link
                className="paginate_button previous disabled"
                to=""
                onClick={() =>
                  activePag.current > 0 && onClick(activePag.current - 1)
                }
              >
                {t("Previous")}
              </Link>
              <span>
                {paggination.map((number, i) => (
                  <Link
                    key={i}
                    to=""
                    className={`paginate_button  ${
                      activePag.current === i ? "current" : ""
                    } `}
                    onClick={() => onClick(i)}
                  >
                    {number}
                  </Link>
                ))}
              </span>

              <Link
                className="paginate_button next"
                to=""
                onClick={() =>
                  activePag.current + 1 < paggination.length &&
                  onClick(activePag.current + 1)
                }
              >
               {t("Next")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsTable;
