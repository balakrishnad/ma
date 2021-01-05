const setUserObj = (userObj) => {
    userObj = JSON.stringify(userObj);
    sessionStorage.setItem('userObj', userObj);
};

const getUserObj = () => {
    const userObj = JSON.parse(sessionStorage.getItem('userObj'));
    return userObj;
};

const getUserEmail = () => {
    let emailID = '';
    if(getUserObj() && getUserObj().emailID){
        emailID = getUserObj().emailID;
    }
    return emailID;
}

const setUserRole = (userRole) => { // to be passed as string
    sessionStorage.setItem('userRole', userRole);
};

const getUserRole = () => {
    return sessionStorage.getItem('userRole');
};

const clearUser = () => {
    sessionStorage.clear();
};
export { setUserObj, getUserObj, setUserRole, getUserRole, clearUser, getUserEmail };