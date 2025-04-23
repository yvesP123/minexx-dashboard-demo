import React,{useState, useEffect, useRef} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Dropdown, Tab, Nav, Modal, Button, Spinner} from 'react-bootstrap';
import axiosInstance from '../../../services/AxiosInstance';
import { toast } from 'react-toastify';

const Users = () => {
    const [data, setData] = useState(
		document.querySelectorAll("#ticket_wrapper tbody tr")
	);
	const [sort, setsort] = useState(10)
    const { platform } = useParams()
	const activePag = useRef(0);
    const [edit, setedit] = useState(0)
    const [userstatus, setuserstatus] = useState()
    const dash = localStorage.getItem(`_dash`) || '3ts'
    const [user, setuser] = useState(JSON.parse(localStorage.getItem(`_authUsr`)))
    const [users, setusers] = useState([])
    const [remove, setremove] = useState()
    const [filtered, setfiltered] = useState([])
    const [companies, setcompanies] = useState({
        threets: [],
        gold: []
    })
    const [add, setadd] = useState()
    const [loading, setloading] = useState(true)
    const [type, settype] = useState('buyer')
    const [access, setaccess] = useState(dash === "3ts" ? '3ts' : 'gold')
    const [name, setname] = useState('')
    const [surname, setsurname] = useState('')
    const [email, setemail] = useState('')
    const [company, setcompany] = useState('ce62eb6o')
    const [mineral, setmineral] = useState(dash === "3ts" ? 'Tin' : 'Gold')

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
    
    const getUsers = ()=>{
        setusers([])
        setfiltered([])
        setloading(true)
        onClick(0)
        axiosInstance.get(`/users/${platform}`).then(response=>{
            setusers(response.data.users)
            setfiltered(response.data.users)
            setloading(false)
        }).catch(err=>{
            setloading(false)
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

    const getCompanies = ()=>{
        axiosInstance.get(`/companies/all`).then(response=>{
            setcompanies(response.data.companies)
        }).catch(err=>{
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

   // use effect
   useEffect(() => {
        getUsers()
        getCompanies()
        setData(document.querySelectorAll("#ticket_wrapper tbody tr"));
        //chackboxFun();
	}, [ platform ]);

  
   // Active pagginarion
   activePag.current === 0 && chageData(0, sort);
   // paggination
//    let paggination = Array(Math.ceil(data.length / sort))
//       .fill()
//       .map((_, i) => i + 1);

    const paggination = arr => {
        const pages = []
        for(let x= 1; x <= Math.ceil(arr.length / sort); x++){
            pages.push(x)
        }
        return pages
    }

   // Active paggination & chage data
	const onClick = (i) => {
		activePag.current = i;
		chageData(activePag.current * sort, (activePag.current + 1) * sort);
		//settest(i);
	};

    const filter = e => {
        let input = e.currentTarget.value

        setfiltered(users.filter(user=>{
            return user.name.toLowerCase().includes(input.toLowerCase()) || user.email.toLowerCase().includes(input.toLowerCase())
        }))
    }

    const createUser = ()=>{
        if(name.length < 3){
            return toast.error("Please provide a valid first name")
        }
        if(surname.length < 3){
            return toast.error("Please provide a valid last name")
        }
        if(email.length < 10){
            return toast.error("Please provide a valid email address")
        }

        setloading(true)
        axiosInstance.post(`/users`, {
            name,
            surname,
            email,
            type,
            access,
            companies: type === 'buyer' || type === 'investor' ? [company] : [],
            minerals: type === 'buyer' || type === 'investor' ? [mineral] : []
        }).then(response=>{
            setloading(false)
            setadd(false)
            setname('')
            setsurname('')
            setemail('')
            setaccess('3ts')
            getUsers()
            toast.success("The user has been successfully added.")
        }).catch(err=>{
            setloading(false)
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

    const updateUser = ()=>{
        if(name.length < 3){
            return toast.error("Please provide a valid first name")
        }
        if(surname.length < 3){
            return toast.error("Please provide a valid last name")
        }
        if(email.length < 10){
            return toast.error("Please provide a valid email address")
        }

        setloading(true)
        axiosInstance.put(`/users/${edit.uid}`, {
            name,
            surname,
            email,
            access,
            uid: edit.uid,
        }).then(response=>{
            setloading(false)
            setadd(false)
            setname('')
            setsurname('')
            setemail('')
            setaccess('3ts')
            getUsers()
            setedit(null)
            toast.success("The user has been successfully updated.")
        }).catch(err=>{
            setloading(false)
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

    const removeUser = ()=>{
        const selected = remove
        setremove(null)
        axiosInstance.delete(`/users/${selected.uid}`).then(response=>{
            toast.success(`${selected.name} has been successfully deleted from dashboard users.`, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
            getUsers()
        }).catch(err=>{
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

    const changeStatus = ()=>{
        const selected = userstatus
        setuserstatus(null)
        axiosInstance.put(`/users/status/${userstatus.uid}`).then(response=>{
            toast.success(`${selected.name} has been successfully ${selected.status === "suspended" ? "activated" : "suspended"} from dashboard users.`, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
            getUsers()
        }).catch(err=>{
            toast.error(err.message, {
                style: {
                    fontFamily: 'Poppins',
                    fontSize: 12
                }
            })
        })
    }

    const paginate = arr => arr.slice(activePag.current * sort, activePag.current * sort + sort)
   
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
        <>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"#"}> Users</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}> Users List</Link></li>
                </ol>
            </div>
            <Modal show={add} className="modal fade" id="details" onHide={() => setadd(false)}>
				<div className="modal-content">
					<div className="modal-header">
						<h3 className="modal-title">Create New User Account</h3>
						<Button variant="" type="button" disabled={loading} className="close" data-dismiss="modal" onClick={() => setadd(false)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
                        <form onSubmit={createUser}>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>First Name</strong>
                                </label>
                                <input type="text" className="form-control"
                                    value={name}
                                    disabled={loading}
                                    placeholder='Name'
                                    onChange={(e) => setname(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Last Name</strong>
                                </label>
                                <input type="text" className="form-control"
                                    value={surname}
                                    placeholder='Surname'
                                    onChange={(e) => setsurname(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Email</strong>
                                </label>
                                <input type="email" className="form-control"
                                    value={email}
                                    placeholder='Email Address'
                                    onChange={(e) => setemail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Dashboard Access</strong>
                                </label>
                                <select onChange={(e) => setaccess(e.target.value)} value={access} className='form-control'>
                                    <option value='3ts'>3Ts</option>
                                    <option value='gold'>Gold</option>
                                    <option value='both'>Both</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>User Type</strong>
                                </label>
                                <select onChange={(e) => settype(e.target.value)} className='form-control'>
                                    <option value='buyer'>Buyer</option>
                                    <option value='minexx'>Admin</option>
                                    <option value='investor'>Investor</option>
                                    <option value='regulator'>Regulator</option>
                                    <option value='supervisor'>Supervisor</option>
                                    <option value='government'>Government</option>
                                </select>
                            </div>
                            { type === 'buyer' || type === 'investor' ?
                            <>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Default Company</strong>
                                </label>
                                <select onChange={(e) => setcompany(e.target.value)}  className='form-control'>
                                    <optgroup label={access === "3ts" ? "3Ts Companies" : access === "gold" ? "Gold Companies" : "All Companies"}>{access === "3ts" ? "3Ts Companies" : access === "gold" ? "Gold Companies" : "All Companies"}</optgroup>
                                    { access === "3ts" ? companies.threets.map(company=><option value={company.id}>{company.name}</option>) : access === "gold" ? companies.gold.map(company=><option value={company.id}>{company.name}</option>) : companies.threets.map(company=><option value={company.id}>{company.name} [3Ts]</option>) }
                                    { access === "both" ? companies.gold.map(company=><option value={company.id}>{company.name} [Gold]</option>) : null }
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Default Mineral</strong>
                                </label>
                                <select onChange={(e) => setmineral(e.target.value)} className='form-control'>
                                { access === "3ts" ? <optgroup>
                                    <option>Tin</option>
                                    <option>Tantalum</option>
                                    <option>Wolframite</option>
                                </optgroup> : <option>Gold</option> }
                                </select>
                            </div>
                            </>
                            : <></> }
                            <div className='text-center'>
                                <small>An auto-generated password will be sent to the user's email shortly. Please ensure a smooth onboarding experience by monitoring the process. Contact support if you have any questions or concerns.</small>
                            </div>
                        </form>
					</div>
                    <div className='modal-footer'>
                        <button type='cancel' disabled={loading} className='btn btn-outline-danger' data-dismiss="modal" onClick={() => setadd(false)}>Dismiss</button>
                        <button type='submit' disabled={loading} onClick={()=>createUser()} className='btn btn-primary'>{loading ? 'Pleaase wait...' : 'Create User'}</button>
                    </div>
				</div>
			</Modal>
            <Modal show={edit} className="modal fade" id="edit" onHide={() => setedit(false)}>
				<div className="modal-content">
					<div className="modal-header">
						<h3 className="modal-title">Update User Details</h3>
						<Button variant="" type="button" disabled={loading} className="close" data-dismiss="modal" onClick={() => setedit(null)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
                        <form onSubmit={updateUser}>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>First Name</strong>
                                </label>
                                <input type="text" className="form-control"
                                    value={name}
                                    disabled={loading}
                                    placeholder='Name'
                                    onChange={(e) => setname(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Last Name</strong>
                                </label>
                                <input type="text" className="form-control"
                                    value={surname}
                                    placeholder='Surname'
                                    onChange={(e) => setsurname(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Email</strong>
                                </label>
                                <input type="email" className="form-control"
                                    value={email}
                                    placeholder='Email Address'
                                    onChange={(e) => setemail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="mb-2 ">
                                    <strong>Dashboard Access</strong>
                                </label>
                                <select onChange={(e) => setaccess(e.target.value)} value={access} className='form-control'>
                                    <option value='3ts'>3Ts</option>
                                    <option value='gold'>Gold</option>
                                    <option value='both'>Both</option>
                                </select>
                            </div>
                        </form>
					</div>
                    <div className='modal-footer'>
                        <button type='cancel' disabled={loading} className='btn btn-outline-danger' data-dismiss="modal" onClick={() => setedit(null)}>Dismiss</button>
                        <button type='submit' disabled={loading} onClick={()=>updateUser()} className='btn btn-primary'>{loading ? 'Pleaase wait...' : 'Update User'}</button>
                    </div>
				</div>
			</Modal>
            <Modal show={remove} className="modal fade" id="postModal" onHide={() => setremove(null)}>
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Are you sure you want to delete this user?</h5>
						<Button variant=""  type="button" className="close" data-dismiss="modal" onClick={() => setremove(null)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
						<p>Deleting this user will remove all their data and access permanently. This action cannot be undone.</p>
                        <p className='rounded border' style={{color: "white", padding: 15, fontSize: 14}}>
                        Name: {remove?.name} {remove?.surname}<br/>
                        Email: {remove?.email}<br/>
                        Role: {remove?.type}
                        </p>
					</div>
                    <div className='modal-footer'>
                        <button type='submit' className='btn btn-sm btn-outline-danger' onClick={()=>removeUser()}>Yes, delete user</button>
                        <button type='cancel' className='btn btn-sm btn-primary' data-dismiss="modal" onClick={() => setremove(null)}>No, dismiss</button>
                    </div>
				</div>
			</Modal>
            <Modal show={userstatus} className="modal fade" id="postModal" onHide={() => setuserstatus(null)}>
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Are you sure you want to {userstatus?.status === 'suspended' ? 'activate' : 'suspend'} this user?</h5>
						<Button variant=""  type="button" className="close" data-dismiss="modal" onClick={() => setuserstatus(null)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
                        <p className='rounded border' style={{color: "white", padding: 15, fontSize: 14}}>
                        Name: {userstatus?.name} {userstatus?.surname}<br/>
                        Email: {userstatus?.email}<br/>
                        Current Status: {userstatus?.status}
                        </p>
					</div>
                    <div className='modal-footer'>
                        <button type='cancel' className='btn btn-sm btn-outline-warning' data-dismiss="modal" onClick={() => setuserstatus(null)}>No, dismiss</button>
                        <button type='submit' className='btn btn-sm btn-primary' onClick={()=>changeStatus()}>Yes, {userstatus?.status === 'suspended' ? 'activate' : 'suspend'}</button>
                    </div>
				</div>
			</Modal>
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Users List</h4>
                            { platform === 'dashboard' ? <Link onClick={()=>setadd(true)} className="btn btn-primary">Add User</Link> : <></>}
                        </div>
                        <div className="card-body">
                            <div className="table-responsive ticket-table">
                                <div id="ticket_wrapper" className="dataTables_wrapper no-footer">
                                    <div className='d-flex justify-content-between mb-3 custom-tab-list'>
                                        <div className='d-flex align-items-center'>
                                            <label className="me-2">Show</label>
                                            <Dropdown className="search-drop">
                                                <Dropdown.Toggle className="">{sort}</Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={()=>{ onClick(0); setsort(10) }}>10</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>{ onClick(0);setsort(25) }}>25</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>{ onClick(0);setsort(50) }}>50</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>{ onClick(0);setsort(75) }}>75</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>{ onClick(0);setsort(100) }}>100</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <label className="ms-2">entries</label>
                                        </div>
                                        <div className="col-3 d-flex align-items-center">
                                            <label className="me-2">Search:</label>
                                            <input type="search" placeholder="" onInput={filter} className="form-control" />
                                        </div>
                                    </div>
                                    <table id="example" className="display dataTablesCard table-responsive-xl dataTable no-footer w-100">
                                        <thead>
                                            <tr>                                         
                                                <th>Name</th>
                                                <th>Access</th>
                                                <th>User Type</th>
                                                {platform === 'dashboard' ? <th>Creation Date</th> : <></> }
                                                {platform === 'dashboard' ? <th>Last Login</th> : <></> }
                                                {platform === 'dashboard' ? <th>Status</th> : <></> }
                                                {platform === 'dashboard' ? <th>Actions</th> : <></> }                                   
                                            </tr>
                                        </thead>
                                        { loading ? <tr><td colSpan={7}><center><Spinner size="lg" style={{ margin: 15 }} role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner></center></td></tr> : <tbody>
                                            {paginate(filtered).map((item, index)=>(
                                                <tr key={item?.uid}>                                                    
                                                    <td>						
                                                        <div>
                                                            <Link to={"#"} className="h5">{item.name} {item?.surname}</Link>
                                                        </div>
                                                        <small className="fs-12 text-muted"> <span className="font-weight-normal1">{item.email}</span></small>
                                                        
                                                    </td>
                                                    <td className={'align-items-center capitalize'}>{item.access ? item.access : `Not Set`}</td>
                                                    <td>{item.type || item.role}</td>
                                                    {item.created ? <td>
                                                        <span className="badge light badge-success">{new Date(item.created).toLocaleString()}</span>
                                                    </td> : <></> }
                                                    {item.lastLogin ? <td>
                                                        <span className="badge light  badge-warning">{new Date(item.lastLogin).toLocaleString()}</span>
                                                    </td> : <></> }
                                                    {item.status ? <td>
                                                        { item.status === 'active' ? 
                                                        <span className="badge badge-success">Active</span>
                                                        : 
                                                            <span className="badge badge-danger">Suspended</span>
                                                        }
                                                    </td> : <></> }
                                                    { platform === 'dashboard' ? <td>
                                                        <div className="d-flex">
                                                            <Link to={"#"} className="btn btn-primary shadow btn-xs sharp me-2" onClick={()=>{setname(item?.name); setsurname(item?.surname); setaccess(item?.access); setemail(item?.email); setedit(item)}}><i className="fas fa-pencil-alt"></i></Link>
                                                            { item.uid  !== user.uid ? <Link to={"#"} className="btn btn-warning shadow btn-xs sharp me-2" onClick={()=>{setuserstatus(item)}}><i className="fas fa-user-edit"></i></Link> : null }
                                                            { item.uid  !== user.uid ? <Link to={"#"} className="btn btn-danger shadow btn-xs sharp" onClick={()=>{setremove(item)}}><i className="fa fa-trash"></i></Link> : null }
                                                        </div>
                                                    </td> : <></> }
                                                </tr>
                                            ))}
                                            
                                        </tbody>
                                        }
                                    </table>
                                    <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                                        <div className="dataTables_info">
                                            Showing {activePag.current * sort + 1} to{" "}
                                            {filtered.length > (activePag.current + 1) * sort
                                                ? (activePag.current + 1) * sort
                                                : filtered.length}{" "}
                                            of {filtered.length} entries
                                        </div>
                                        <div
                                            className="dataTables_paginate paging_simple_numbers mb-0"
                                            id="example2_paginate"
                                        >
                                            <Link
                                                className="paginate_button previous disabled"
                                                onClick={() =>{
                                                    if(activePag.current > 0){
                                                        onClick(activePag.current - 1)
                                                    }
                                                }}
                                            >
                                                {/* <i className="fa-solid fa-angle-left"></i> */}
                                                Previous
                                            </Link>
                                            <span>
                                                { paggination(users).map((page, i)=>{
                                                    return <Link
                                                        key={i}
                                                        className={`paginate_button  ${
                                                            activePag.current === i ? "current" : ""
                                                        } `}
                                                        onClick={() => onClick(i)}
                                                    >
                                                        {page}
                                                    </Link>
                                                }) }
                                            </span>

                                            <Link
                                                className="paginate_button next"
                                                to={`/users/${platform}`}
                                                onClick={() => {
                                                    if(activePag.current + 1 < paggination(users).length){
                                                        onClick(activePag.current + 1)
                                                    }
                                                }}
                                            >
                                                {/* <i className="fa-solid fa-angle-right"></i> */}
                                                Next
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default Users;