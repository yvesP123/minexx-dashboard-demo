import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { baseURL_ } from "../../../config";
import axiosInstance from '../../../services/AxiosInstance';
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import { Logout } from '../../../store/actions/AuthActions';
import { useDispatch } from "react-redux";
import { Modal, Spinner, ProgressBar } from "react-bootstrap";
import { Loader, Segment } from 'semantic-ui-react';
import QRCodeWithPrintButton from './QRCodeWithPrintButton';
import { translations } from './Exporttranslation';

const Exports = ({ language, country }) => {	  
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);
    const [exports, setExports] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [tablehead, setTablehead] = useState([]);
    const [attachment, setAttachment] = useState();
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState({});
    const access = localStorage.getItem(`_dash`) || '3ts';

    // Memoized translations function to avoid recreating on every render
    const t = useCallback((key) => {
        if (!translations[language]) {
          return key;
        }
        return translations[language][key] || key;
    }, [language]);

    // Normalize country name once when it changes
    const normalizedCountry = useMemo(() => {
        let result = country.trim();
        
        if (result.toLowerCase() === 'rwanda') {
            return 'Country';
        } else {
            return result.replace(/^\.+|\.+$/g, '');
        }
    }, [country]);

    // Fetch exports and progress data
    const fetchExports = useCallback(async() => {
        try {
            setLoading(true);
            
            let response = await axiosInstance.get(`exports`, {
                params: {
                    country: normalizedCountry,
                }
            });
            
            // Sort the export data by date with latest first
            const exportData = response.data.exports.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            setExports(exportData);
            
            // Create a batch of progress requests
            const progressPromises = exportData
                .filter(item => item.exportationID) // Only process items with ID
                .map(item => ({
                    id: item.exportationID,
                    promise: axiosInstance.get(`progressbar`, {
                        params: { id: item.exportationID }
                    }).catch(err => {
                        console.error(`Failed to fetch progress for ${item.exportationID}:`, err);
                        return { data: { progressbarExport: [{ percentage: 0 }] } };
                    })
                }));
            
            // Execute all promises in parallel
            const results = await Promise.all(progressPromises.map(item => item.promise));
            
            // Process results into a map
            const progressDataObj = {};
            progressPromises.forEach((item, index) => {
                const response = results[index];
                if (response.data.progressbarExport && 
                    response.data.progressbarExport.length > 0) {
                    progressDataObj[item.id] = response.data.progressbarExport[0];
                } else {
                    progressDataObj[item.id] = { percentage: 0 };
                }
            });
            
            setProgressData(progressDataObj);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            if (err.response?.code === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.error(err.message || "Failed to fetch exports");
            }
        }
    }, [normalizedCountry, dispatch, navigate]);

    // Filtered exports using useMemo to avoid recalculating on every render
    const filtered = useMemo(() => {
        if (!searchInput) return exports;
        
        const input = searchInput.toLowerCase();
        let filteredData = [];
        
        if (access === '3ts') {
            filteredData = exports.filter(exp => 
                (exp.exportationID?.toLowerCase() || '').includes(input) || 
                (exp.company?.name?.toLowerCase() || '').includes(input)
            );
        } else {
            filteredData = exports.filter(exp => 
                (exp[tablehead.indexOf('Transaction Unique ID')]?.toLowerCase() || '').includes(input) || 
                (exp[tablehead.indexOf('Name of processor/refiner/exporter')]?.toLowerCase() || '').includes(input) || 
                (exp[tablehead.indexOf('Gold Export License Number')]?.toLowerCase() || '').includes(input) ||
                (exp[tablehead.indexOf('Type of minerals exported')]?.toLowerCase() || '').includes(input)
            );
        }
        
        return filteredData;
    }, [exports, searchInput, tablehead, access]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchInput(e.currentTarget.value);
    };

    // Show attachment with error handling
    const showAttachment = useCallback((file, field) => {
        axiosInstance.post(`${baseURL_}image`, { file })
            .then(response => {
                setAttachment({image: response.data.image, field});
            })
            .catch(err => {
                if (err.response?.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.error(err.message || "Failed to load attachment");
                }
            });
    }, [dispatch, navigate]);

    // Determine progress bar variant based on percentage
    const getProgressVariant = useCallback((percentage) => {
        if (percentage < 25) return "danger";
        if (percentage < 50) return "warning";
        if (percentage < 75) return "info";
        return "success";
    }, []);

    // Only fetch data when country changes, not language
    useEffect(() => {
        fetchExports();
    }, [fetchExports]);

    // Update page title when language changes
    useEffect(() => {
        changeTitle(`${t('Exports')} | Minexx`);
    }, [changeTitle, t]);

    return(
        <Segment>
            <Loader active={loading} />
            { attachment ? 
                <Modal size='lg' show={!!attachment} onHide={() => setAttachment(null)}>
                    <Modal.Header>
                        <h3 className='modal-title'>{attachment.field}</h3>
                        <Link className='modal-dismiss' onClick={() => setAttachment(null)}>x</Link>
                    </Modal.Header>
                    <Modal.Body>
                        <img 
                            alt='' 
                            className='rounded mt-4' 
                            width={'100%'} 
                            src={`https://lh3.googleusercontent.com/d/${attachment.image}=w2160?authuser=0`}
                            loading="lazy" // Add lazy loading for images
                        />
                    </Modal.Body>
                </Modal> 
                : null 
            }
            
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"/overview"}>{t('Dashboard')}</Link></li>
                    <li className="breadcrumb-item"><Link to={""} >{t('Exports')}</Link></li>
                </ol>
            </div>
            
            <div className="row">
                <div className="col-xl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">{t('Exports')}</h4>
                            <div>
                                <input 
                                    className="form-control" 
                                    placeholder={t('search')} 
                                    onChange={handleSearchChange}
                                    value={searchInput}
                                />
                            </div>
                        </div>
                        <div className="card-body">
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
                                                <th className="sorting_asc" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1} aria-sort="ascending">
                                                    <div className="custom-control custom-checkbox">
                                                        <input type="checkbox" className="custom-control-input" id="checkAll" required />
                                                        <label className="custom-control-label" htmlFor="checkAll" />
                                                    </div>
                                                </th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('CompanyName')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('ExportationID')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Date')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('MineralType')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Grade')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('NetWeight')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Track')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('TradeTimeline')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('QrCode')}</th> 
                                            </tr>
                                        </thead>
                                        {loading ? 
                                            <tbody>
                                                <tr><td colSpan={9}><center><Spinner size="md" style={{ margin: 15 }} role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner></center></td></tr> 
                                            </tbody>
                                            : <tbody>
                                            {filtered.length === 0 ?
                                                <tr role="row" className="odd">
                                                    <td colSpan={9} className="sorting_1 text-center">{t('NoExportRecords')}</td>
                                                </tr>
                                                : filtered.map(_export => (
                                                    <tr role="row" key={_export.id} className="odd">
                                                        <td className="sorting_1">
                                                            <div className="custom-control custom-checkbox ">
                                                                <input type="checkbox" className="custom-control-input" id={`customCheckBox_${_export.id}`} required />
                                                                <label className="custom-control-label" htmlFor={`customCheckBox_${_export.id}`} />
                                                            </div>
                                                        </td>
                                                        <td><Link to={`/company/${_export?.company?.id}`}>{_export?.company?.name}</Link></td>
                                                        <td><Link className={_export.exportationID ? "text-primary" : "text-danger"} to={`/exports/${_export?.id}`}>{_export.exportationID ? _export.exportationID : "Exportation ID Missing"}</Link></td>
                                                        <td>{new Date(_export.date).toString().substring(0, 16)}</td>
                                                        <td>
                                                            <span className="badge light badge-warning">
                                                                <i className="fa fa-circle text-danger me-1" />
                                                                {_export.mineral}
                                                            </span>
                                                        </td>
                                                        <td>{_export.grade}</td>
                                                        <td>{access === '3ts' ? _export.netWeight : (_export.netWeight/1000).toFixed(2)}</td>
                                                        <td>{_export.link ? <a target="_blank" href={`${_export.link}`} className="text-primary" rel="noreferrer">Track Shipment</a> : <span className="text-warning">Tracking not available</span>}</td>
                                                        <td>
                                                            {_export.exportationID && progressData[_export.exportationID] ? 
                                                                <a href={`/time-tracking/?id=${_export?.exportationID}`} rel="noreferrer" style={{ display: 'block', textDecoration: 'none', width: '100%' }}>
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="me-2 font-weight-bold" style={{ minWidth: '40px' }}>
                                                                            {progressData[_export.exportationID].percentage || 0}%
                                                                        </span>
                                                                        <ProgressBar 
                                                                            now={progressData[_export.exportationID].percentage || 0} 
                                                                            variant={getProgressVariant(progressData[_export.exportationID].percentage || 0)}
                                                                            style={{ height: '20px', width: '100%', minWidth: '60px' }}
                                                                        />
                                                                    </div>
                                                                </a> : 
                                                                <span className="text-warning">Progress not available</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <QRCodeWithPrintButton value={`https://minexx-scann-mysql.vercel.app/export/${_export?.id}/${_export?.company?.id}/?x-platform=${_export.mineral === 'Gold' ? 'gold' : '3ts'}`} />
                                                        </td> 
                                                    </tr> 
                                                ))}
                                            </tbody>
                                        }
                                    </table> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Segment>
    );
};

export default Exports;