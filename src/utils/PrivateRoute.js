import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { getUserObj } from './userRolehelper';
import * as Constants from './constants';
import Unauthorized from '../containers/Unauthorized/Unauthorized';

const PrivateRoute = ({ component: Component, path, role, getMenuBasedOnRoleName, changeUserRole, getNotificationCount }) => {
    const history = useHistory();
    const [isHomePage, setIsHomePage] = useState(true);

    useEffect(() => {
        if (getMenuBasedOnRoleName(role).length === 0) {
            setIsHomePage(true);
        } else {
            const isMenu = getMenuBasedOnRoleName(role).some(role => role['route'] === path);
            if (isMenu) {
                setIsHomePage(true);
            } else {
                if (role === Constants.ADMIN) {
                    history.push('/dashboard');
                } else {
                    history.push('/home');
                }
            }
        }
    }, [role]);

    useEffect(() => {
        const userObj = getUserObj();
        let isMenu = false;
        if (userObj) {
            for (let index = 0; index < userObj.roles.length; index++) {
                const userRole = userObj.roles[index];
                isMenu = getMenuBasedOnRoleName(role).some(role => role['route'] === path);
                if (userRole.RoleName !== role && !isMenu) {
                    isMenu = getMenuBasedOnRoleName(userRole.RoleName).some(role => role['route'] === path);
                    if (isMenu) {
                        changeUserRole(userRole.RoleName);
                    }
                }
                if (isMenu) {
                    break;
                }
            }
        }
        setIsHomePage(isMenu);
    }, [path]);

    return (
        <Route render={(props) => {
            const newProps = { ...props, Role: role, getNotificationCount };
            return (isHomePage ? <Component {...newProps} /> : <Unauthorized />);
        }} />
    );
}


export default PrivateRoute;