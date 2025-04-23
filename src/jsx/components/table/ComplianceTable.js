import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { translations } from '../../pages/Companytranslation';
const ComplianceTable = ({ documents,language }) => {
  const [data, setData] = useState(
    document.querySelectorAll("#allreview tbody tr")
  );
  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };
  const sort = 6;
  const activePag = useRef(0);
  const [docu, setdocu] = useState()

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
  // use effect
  useEffect(() => {
    setData(document.querySelectorAll("#allreview tbody tr"));
   // chackboxFun();
  }, [ documents,language ]);


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
  };

  const chackbox = document.querySelectorAll(".sorting_1 input");
  const motherChackBox = document.querySelector(".sorting_asc input");
  const chackboxFun = (type) => {
    for (let i = 0; i < chackbox.length; i++) {
      const element = chackbox[i];
      if (type === "all") {
        if (motherChackBox.checked) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      } else {
        if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }
  };

  return (
    <div id="All" className="tab-pane">
      <Modal size="lg" show={docu} onBackDropClick={()=>setdocu(null)}>
        <Modal.Header title={docu?.type}>
        <h5>{docu?.type}</h5>
        </Modal.Header>
        <Modal.Body>
          <iframe title={`${docu?.file}`} src={`https://drive.google.com/file/d/${docu?.file}/preview`} width="100%" height="600" allow="autoplay"></iframe>
        </Modal.Body>
        <Modal.Footer>
          <button className="modal-dismiss btn btn-warning" onClick={()=>setdocu(null)}>Close</button>
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
					{/**<th className="sorting_asc" tabIndex="0" aria-controls="example5" rowSpan="1"
						colSpan="1" aria-sort="ascending" aria-label=": activate to sort column descending" 
					>
						<div className="checkbox me-0 align-self-center">
							<div className="form-check custom-checkbox ">
								<input type="checkbox" onClick={() => chackboxFun("all")} className="form-check-input" id="checkAll" required=""/>
								<label className="form-check-label" htmlFor="checkAll"></label>
							</div>
						</div>
					</th>
					<th
						className="sorting"
						tabIndex="0" aria-controls="example5" rowSpan="1" colSpan="1"
						aria-label="Customer: activate to sort column ascending"
					>
						Attachment
          </th>*/}
					<th
						className="d-none d-lg-table-cell sorting" tabIndex="0" aria-controls="example5"
						rowSpan="1" colSpan="1" aria-label="Event NAME: activate to sort column ascending"
					>
					{t('Attachment')}
					</th>
					{/* <th
						className="sorting" tabIndex="0" aria-controls="example5" rowSpan="1"
						colSpan="1" aria-label="Stars Review: activate to sort column ascending" 
					>
						Uploaded
					</th> */}
					<th
						className="sorting" 
					>
						{t('Action')}
					</th>
				</tr>
            </thead>

            <tbody>
              {documents.length === 0 ? <tr>
                <td className="pa-5 text-center font-w200" colSpan={4}>{t('Noducument')}</td>
              </tr>
              : documents.map( (doc, i) => <tr key={`doc${i}`} role="row" className="odd">
                {/**<td className="sorting_1">
                  <div className="checkbox me-0 align-self-center">
                    <div className="form-check custom-checkbox ">
                      <input
                      type="checkbox"
                      onClick={() => chackboxFun()}
                      className="form-check-input"
                      id="customCheckBox2"
                      required=""
                      />
                      <label
                      className="form-check-label"
                      htmlFor="customCheckBox2"
                      ></label>
                    </div>
                  </div>
              </td>*/}
                <td>
                  <div className="media align-items-center pointer" onClick={()=>setdocu(doc)}>
                    {/* <img className="img-fluid rounded me-3 d-none d-xl-inline-block" width="70" src={'https://cdn-icons-png.flaticon.com/128/337/337946.png'} alt="Minexx"/> */}
                    <div className="media-body">
                      <h4 className="font-w600 mb-1 wspace-no">{doc.type}</h4>
                      <span>{ doc.date }</span>
                    </div>
                  </div>
                </td>
                {/*<td className="d-none d-lg-table-cell">{doc.type === `Other` ? `${doc.other} (Other)` : doc.type} Document</td>
                {/* <td>
                    <p className="mb-0 d-none d-xl-inline-block">
                    Not specified.
                    </p>
                </td> */}
                <td>
                  <div className="d-flex">
                    <Link to="" title="View Attachment" onClick={()=>setdocu(doc)} className="btn btn-success light btn-sm px-4"><FontAwesomeIcon icon={icon({ name: 'file' })} /></Link>
                    <Link to={`https://drive.usercontent.google.com/download?id=${doc.file}&export=download&authuser=0`} title="Download" className="btn btn-primary light btn-sm mx-4 px-4"><FontAwesomeIcon icon={icon({ name: 'download' })} /></Link>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>

          <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
            <div className="dataTables_info">
              {t('Showing')} {activePag.current * sort + 1} to{" "}
              {data.length > (activePag.current + 1) * sort
                ? (activePag.current + 1) * sort
                : data.length}{" "}
              {t('of')} {data.length} {t('entries')}
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
                {t('Previous')}
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
                {t('Next')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTable;
