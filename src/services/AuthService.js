import axios from 'axios';
import swal from "sweetalert";
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';

export function signUp(email, password) {
    //axios call
    const postData = {
        email,
        password,
        returnSecureToken: true,
    };
    const apiKey = process.env.apiKey_authservice
    return axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD3RPAp3nuETDn9OQimqn_YF6zdzqWITII`,
        postData,
    );
}
 
export function login(email, password) {
    const postData = {
        email,
        password,
        returnSecureToken: true,
    };
    return axios.post( 
        `https://minexxapi-demo-p7n5ing2cq-uc.a.run.app/login`,
        postData,
    );
}

export function formatError(errorResponse) {
    return errorResponse.message
}

export function saveTokenInLocalStorage(data) {
    localStorage.setItem('_authTkn', data.accessToken);
    localStorage.setItem('_authRfrsh', data.refreshToken);
    localStorage.setItem('_authUsr', JSON.stringify(data.user));
    localStorage.setItem('_dash', data.user.access === 'both' ? '3ts' : data.user.access);
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('_authUsr');
    let tokenDetails = '';
    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
		return;
    }

    tokenDetails = JSON.parse(tokenDetailsString);
    // let expireDate = new Date(tokenDetails.expireDate);
    // let todaysDate = new Date();

    // if (todaysDate > expireDate) {
    //     dispatch(Logout(navigate));
    //     return;
    // }
		
    dispatch(loginConfirmedAction(tokenDetails));
	
    // const timer = expireDate.getTime() - todaysDate.getTime();
    // runLogoutTimer(dispatch, 100, navigate);
}
